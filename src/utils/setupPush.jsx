// src/utils/setupPushToken.js (경로는 네가 쓰는 대로)
import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { supabase } from "../supabaseClient";
import { app } from "../firebase";

export async function setupPushToken() {
  console.log("[setupPushToken] 호출됨");

  try {
    // 0) 브라우저 지원 여부
    const supported = await isSupported();
    console.log("[setupPushToken] messaging isSupported:", supported);
    if (!supported) {
      console.log("[setupPushToken] 이 브라우저는 FCM을 지원하지 않습니다.");
      return;
    }

    // 1) 권한 요청
    const permission = await Notification.requestPermission();
    console.log("[setupPushToken] Notification permission:", permission);
    if (permission !== "granted") {
      console.log("[setupPushToken] 푸시 권한 거부됨");
      return;
    }

    // 2) 현재 로그인 유저 확인
    const { data: userData, error: userError } = await supabase.auth.getUser();
    console.log("[setupPushToken] getUser 결과:", { userData, userError });

    const user = userData?.user;
    if (userError || !user) {
      console.log("[setupPushToken] 로그인된 유저가 없습니다.");
      return;
    }
    const userId = user.id;
    console.log("[setupPushToken] current user id:", userId);

    // 3) messaging 인스턴스 생성
    const messaging = getMessaging(app);
    console.log("[setupPushToken] messaging 인스턴스 생성 완료");

    // 4) VAPID 키는 .env에서 가져오기 (VITE_ 프리픽스 필수)
    const vapidKey = import.meta.env.VITE_FCM_VAPID_KEY;
    console.log("[setupPushToken] VAPID KEY 존재 여부:", !!vapidKey);
    if (!vapidKey) {
      console.error(
        "[setupPushToken] VITE_FCM_VAPID_KEY가 설정되어 있지 않습니다."
      );
      return;
    }

    // 5) 토큰 발급
    const token = await getToken(messaging, { vapidKey });
    console.log("[setupPushToken] getToken 결과:", token);

    if (!token) {
      console.log("[setupPushToken] FCM 토큰 없음 (null/undefined)");
      return;
    }

    // 6) Supabase에 저장
    const { error } = await supabase.from("user_push_tokens").upsert(
      {
        user_id: userId,
        fcm_token: token,
      },
      { onConflict: "user_id" } // 같은 user_id면 업데이트
    );

    if (error) {
      console.error("[setupPushToken] push token 저장 에러:", error);
    } else {
      console.log("[setupPushToken] push token 저장 성공!");
    }
  } catch (e) {
    console.error("[setupPushToken] 전체 에러:", e);
  }
}
