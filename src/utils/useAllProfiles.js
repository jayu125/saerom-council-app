// hooks/useAllProfiles.js (또는 ts)
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export function useAllProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("profiles")
          .select("id, display_name, department, role");

        if (error) {
          console.error("[useAllProfiles] error:", error);
          return;
        }

        if (!cancelled && data) {
          // 🔴 DB 컬럼 이름: display_name
          // 🟢 프론트에서 쓸 필드 이름: name
          const mapped = data.map((row) => ({
            id: row.id,
            name: row.display_name ?? "이름 없음",
            department: row.department,
            role: row.role,
          }));
          setProfiles(mapped);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { profiles, loading };
}
