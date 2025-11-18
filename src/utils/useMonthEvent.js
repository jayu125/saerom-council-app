// hooks/useMonthEvents.ts
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import { monthRangeUTC } from "../utils/dateRange";

export function useMonthEvents(year, month) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const range = useMemo(() => monthRangeUTC(year, month), [year, month]);

  useEffect(() => {
    // console.log("[useMonthEvents] events 변경됨:", events);
  }, [events]);

  // hooks/useMonthEvents.ts
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    supabase
      .from("events")
      .select("*")
      .gte("starts_at", range.start)
      .lte("starts_at", range.end)
      .order("starts_at", { ascending: true })
      .then(({ data, error }) => {
        if (error) console.error(error);
        if (!cancelled && data) setEvents(data);
      })
      .finally(() => !cancelled && setLoading(false));

    const channel = supabase
      .channel("events-month")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        (payload) => {
          // console.log("[realtime] payload 도착:", payload);

          // 1️⃣ DELETE는 따로 처리 (starts_at 필요 없음)
          if (payload.eventType === "DELETE") {
            const row = payload.old ?? payload.new;
            if (!row?.id) {
              // console.log("[realtime] DELETE row에 id 없음, 스킵:", row);
              return;
            }

            setEvents((prev) => {
              const next = prev.filter((e) => e.id !== row.id);
              // console.log("[realtime][DELETE] setEvents 호출, next =", next);
              return next;
            });

            return; // ⬅️ 아래 INSERT/UPDATE 로직으로 안 내려가게 종료
          }

          // 2️⃣ INSERT / UPDATE 는 기존 로직 (starts_at + range 체크 필요)
          const row = payload.new;
          if (!row) {
            // console.log("[realtime] row 없음, 스킵");
            return;
          }

          if (!row.starts_at) {
            // console.log("[realtime] starts_at 없음, 스킵:", row);
            return;
          }

          const ts = new Date(row.starts_at);
          if (isNaN(+ts)) {
            // console.log("[realtime] Invalid Date, 스킵:", row.starts_at);
            return;
          }

          const iso = ts.toISOString();
          console.log(
            "[realtime] ts(UTC):",
            iso,
            "range:",
            range.start,
            range.end
          );

          if (iso >= range.start && iso <= range.end) {
            setEvents((prev) => {
              const map = new Map(prev.map((e) => [e.id, e]));
              map.set(row.id, row);

              const next = Array.from(map.values()).sort(
                (a, b) => +new Date(a.starts_at) - +new Date(b.starts_at)
              );
              // console.log("[realtime][UPSERT] setEvents 호출, next =", next);
              return next;
            });
          } else {
            // console.log("[realtime] range 밖이라 setEvents 안 함");
          }
        }
      )
      .subscribe((status) => {
        // console.log("[realtime] channel status:", status);
      });

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [range.start, range.end]);

  // 날짜별 그룹 (YYYY-MM-DD -> events[])
  const byDate = useMemo(() => {
    const m = new Map();
    for (const ev of events) {
      const d = new Date(ev.starts_at);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      if (!m.has(key)) m.set(key, []);
      m.get(key).push(ev);
    }
    return m;
  }, [events]);

  return { events, byDate, loading };
}
