// src/dev/DebugRlsPanel.jsx
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function DebugRlsPanel() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState(null);
  const [eventAttendees, setEventAttendees] = useState(null);
  const [meetings, setMeetings] = useState(null);
  const [meetingAttendees, setMeetingAttendees] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        // 1) 현재 로그인 유저
        const { data: userData, error: userError } =
          await supabase.auth.getUser();
        if (userError) throw userError;
        setUser(userData.user);
        console.log("[DEBUG RLS] current user:", userData.user);

        // 2) events 전부 조회 (RLS가 필터링한 상태로)
        const { data: evData, error: evError } = await supabase
          .from("events")
          .select("*")
          .order("starts_at", { ascending: true });

        if (evError) throw evError;
        setEvents(evData);
        console.log("[DEBUG RLS] events:", evData);

        // 3) event_attendees 전부 조회
        const { data: eaData, error: eaError } = await supabase
          .from("event_attendees")
          .select("*");

        if (eaError) throw eaError;
        setEventAttendees(eaData);
        console.log("[DEBUG RLS] event_attendees:", eaData);

        // 4) meetings 전부 조회
        const { data: mData, error: mError } = await supabase
          .from("meetings")
          .select("*")
          .order("starts_at", { ascending: true });

        if (mError) throw mError;
        setMeetings(mData);
        console.log("[DEBUG RLS] meetings:", mData);

        // 5) meeting_attendees 전부 조회
        const { data: maData, error: maError } = await supabase
          .from("meeting_attendees")
          .select("*");

        if (maError) throw maError;
        setMeetingAttendees(maData);
        console.log("[DEBUG RLS] meeting_attendees:", maData);
      } catch (err) {
        console.error("[DEBUG RLS] error:", err);
        setError(err.message ?? String(err));
      }
    })();
  }, []);

  return (
    <div
      style={{
        marginTop: 16,
        padding: 12,
        borderRadius: 8,
        background: "rgba(255,255,255,0.02)",
        fontSize: 11,
        color: "var(--Text-sub)",
        maxHeight: 300,
        overflowY: "auto",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 8 }}>🔍 RLS Debug Panel</div>
      {error && <div style={{ color: "tomato" }}>Error: {error}</div>}
      <pre style={{ whiteSpace: "pre-wrap" }}>
        {JSON.stringify(
          {
            user,
            events,
            eventAttendees,
            meetings,
            meetingAttendees,
          },
          null,
          2
        )}
      </pre>
    </div>
  );
}
