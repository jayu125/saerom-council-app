// src/shared/calendarHeaderBus.ts
import { useEffect, useState } from "react";

const EVENT = "calendar-ym";

export function publishCalendarYM(year, month) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { year, month } }));
}
export function useCalendarYM() {
  const today = new Date();
  const def = { year: today.getFullYear(), month: today.getMonth() + 1 };
  const [ym, setYM] = useState(def);
  useEffect(() => {
    const handler = (e) => setYM(e.detail);
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, []);
  return ym;
}
