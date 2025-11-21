// supabase/functions/notify-today-meetings/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
// 🔥 Deno에서는 esm.sh로 import 해야 함
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ---------- CORS 헤더 ----------
const corsHeaders: HeadersInit = {
  "Access-Control-Allow-Origin": "*", // 필요하면 나중에 특정 도메인으로 제한 가능
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ---------- FCM v1 설정에 필요한 env ----------
const FCM_PROJECT_ID = Deno.env.get("FCM_PROJECT_ID")!;
const FCM_CLIENT_EMAIL = Deno.env.get("FCM_CLIENT_EMAIL")!;
const FCM_PRIVATE_KEY = (Deno.env.get("FCM_PRIVATE_KEY") || "").replace(
  /\\n/g,
  "\n"
); // 환경변수에 줄바꿈 이스케이프되어 있으면 복구

if (!FCM_PROJECT_ID || !FCM_CLIENT_EMAIL || !FCM_PRIVATE_KEY) {
  console.warn(
    "[notify-today-meetings] FCM env 설정이 부족합니다. 푸시 전송이 실패할 수 있습니다."
  );
}

// ---------- Supabase 클라이언트(서비스 롤) ----------
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

// ---------- util: 오늘 시작/끝 시각(UTC 기준) ----------
function getTodayRangeUTC() {
  const now = new Date();
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0)
  );
  const end = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      23,
      59,
      59
    )
  );
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

// ---------- util: JWT → AccessToken (FCM v1용) ----------
async function getGoogleAccessToken(): Promise<string> {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600;

  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const payload = {
    iss: FCM_CLIENT_EMAIL,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat,
    exp,
  };

  const base64url = (input: string | Uint8Array) => {
    let str: string;
    if (input instanceof Uint8Array) {
      str = btoa(String.fromCharCode(...input));
    } else {
      str = btoa(input);
    }
    return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  };

  const encoder = new TextEncoder();
  const headerB64 = base64url(JSON.stringify(header));
  const payloadB64 = base64url(JSON.stringify(payload));
  const unsigned = `${headerB64}.${payloadB64}`;

  const key = await crypto.subtle.importKey(
    "pkcs8",
    Uint8Array.from(
      atob(FCM_PRIVATE_KEY.replace(/-----.*?-----/g, "").replace(/\s+/g, "")),
      (c) => c.charCodeAt(0)
    ),
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );

  const signature = new Uint8Array(
    await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, encoder.encode(unsigned))
  );
  const signatureB64 = base64url(signature);

  const jwt = `${unsigned}.${signatureB64}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!tokenRes.ok) {
    console.error("[FCM] access token 요청 실패", await tokenRes.text());
    throw new Error("Failed to get access token");
  }

  const tokenJson = await tokenRes.json();
  return tokenJson.access_token as string;
}

// ---------- util: FCM v1으로 푸시 발송 ----------
async function sendFcmMessage(token: string, title: string, body: string) {
  const accessToken = await getGoogleAccessToken();

  const res = await fetch(
    `https://fcm.googleapis.com/v1/projects/${FCM_PROJECT_ID}/messages:send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        message: {
          token,
          notification: {
            title,
            body,
          },
          data: {
            type: "today_meeting",
          },
        },
      }),
    }
  );

  if (!res.ok) {
    console.error("[FCM] 메시지 전송 실패:", await res.text());
    throw new Error("Failed to send FCM message");
  }
}

// ---------- 메인 핸들러 ----------
serve(async (req) => {
  // 🔴 1) CORS preflight 처리
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  // 🔴 2) POST 이외는 막기 (CORS 헤더 포함)
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    // 프론트에서 Authorization: Bearer <access_token> 자동으로 붙음
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      return new Response("Unauthorized", {
        status: 401,
        headers: corsHeaders,
      });
    }

    // 현재 유저 확인
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error("[notify-today-meetings] auth error:", userError);
      return new Response("Unauthorized", {
        status: 401,
        headers: corsHeaders,
      });
    }

    const userId = user.id;
    const { start, end } = getTodayRangeUTC();

    // 1) 내가 만든 회의
    const { data: created, error: createdErr } = await supabase
      .from("meetings")
      .select("*")
      .gte("starts_at", start)
      .lte("starts_at", end)
      .eq("created_by", userId);

    if (createdErr) {
      console.error("[notify-today-meetings] created fetch err:", createdErr);
    }

    // 2) 참석자로 포함된 회의
    const { data: attending, error: attendingErr } = await supabase
      .from("meetings")
      .select("*, meeting_attendees!inner(user_id)")
      .gte("starts_at", start)
      .lte("starts_at", end)
      .eq("meeting_attendees.user_id", userId);

    if (attendingErr) {
      console.error(
        "[notify-today-meetings] attending fetch err:",
        attendingErr
      );
    }

    // 3) 두 결과 합치고 중복 제거
    const map = new Map<string, any>();
    (created || []).forEach((m) => map.set(m.id, m));
    (attending || []).forEach((m) => map.set(m.id, m));

    const todaysMeetings = Array.from(map.values());

    if (todaysMeetings.length === 0) {
      return new Response(
        JSON.stringify({
          ok: true,
          meetings: 0,
          message: "오늘 회의 없음",
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // 사용자 FCM 토큰
    const { data: tokenRow, error: tokenErr } = await supabase
      .from("user_push_tokens")
      .select("fcm_token")
      .eq("user_id", userId)
      .single();

    if (tokenErr || !tokenRow?.fcm_token) {
      console.error("[notify-today-meetings] FCM 토큰 없음 / 에러:", tokenErr);
      return new Response(
        JSON.stringify({ ok: false, reason: "no_fcm_token" }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const first = todaysMeetings[0];
    const title = "오늘 회의 알림";
    const body =
      todaysMeetings.length === 1
        ? `오늘 "${first.title}" 회의가 예정되어 있습니다.`
        : `오늘 포함된 회의가 ${todaysMeetings.length}건 있습니다.`;

    await sendFcmMessage(tokenRow.fcm_token, title, body);

    return new Response(
      JSON.stringify({
        ok: true,
        meetings: todaysMeetings.length,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (e) {
    console.error("[notify-today-meetings] unexpected error:", e);
    return new Response("Internal Server Error", {
      status: 500,
      headers: corsHeaders,
    });
  }
});
