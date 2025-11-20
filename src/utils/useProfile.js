// src/hooks/useProfile.js
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function useProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // 1) 현재 로그인 유저
        const { data: userData, error: userError } =
          await supabase.auth.getUser();
        if (userError) throw userError;
        if (!userData?.user) {
          throw new Error("로그인이 필요합니다.");
        }
        const user = userData.user;

        // 2) profiles에서 내 정보 가져오기
        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("id, display_name, department, role")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;
        if (!cancelled) {
          setProfile({
            ...data,
            email: user.email, // 필요하면 email도 같이 내려주기
          });
        }
      } catch (err) {
        console.error("[useProfile] 에러:", err);
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { profile, loading, error };
}
