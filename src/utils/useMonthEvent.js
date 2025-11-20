// hooks/useMonthEvents.ts
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import { monthRangeUTC } from "../utils/dateRange";

export function useMonthEvents(year, month) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const range = useMemo(() => monthRangeUTC(year, month), [year, month]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    (async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .gte("starts_at", range.start)
        .lte("starts_at", range.end)
        .order("starts_at", { ascending: true });

      if (error) {
        console.error("[useMonthEvents] fetch error:", error);
        if (!cancelled) setEvents([]);
        return;
      }

      if (!cancelled && data) {
        // 🔥 RLS 통과한 row들만 오므로 별도 visibility 필터 불필요
        setEvents(data);
      }
    })().finally(() => {
      if (!cancelled) setLoading(false);
    });

    const channel = supabase
      .channel("events-month")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        (payload) => {
          // DELETE는 starts_at 없어도 되니까 별도 처리
          if (payload.eventType === "DELETE") {
            const row = payload.old ?? payload.new;
            if (!row?.id) return;

            setEvents((prev) => prev.filter((e) => e.id !== row.id));
            return;
          }

          const row = payload.new;
          if (!row?.starts_at) return;

          const ts = new Date(row.starts_at);
          if (isNaN(+ts)) return;

          const iso = ts.toISOString();

          // 현재 보고 있는 month 범위 안/밖 판단
          if (iso < range.start || iso > range.end) {
            // 범위 밖으로 나가면 리스트에서 제거
            setEvents((prev) => prev.filter((e) => e.id !== row.id));
            return;
          }

          // 🔥 이 시점에 row는 이미 RLS 통과한 데이터
          //    → visibility, attendees 여부는 DB 쪽 정책에서 이미 결정됨
          setEvents((prev) => {
            const map = new Map(prev.map((e) => [e.id, e]));
            map.set(row.id, row);

            const next = Array.from(map.values()).sort(
              (a, b) => +new Date(a.starts_at) - +new Date(b.starts_at)
            );
            return next;
          });
        }
      )
      .subscribe();

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
