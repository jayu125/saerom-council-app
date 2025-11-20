// pages/meetingPage.jsx
import styled from "styled-components";
import { useEffect, useMemo, useState } from "react";
import { useModal } from "../components/modal";
import AddMeetingModal from "../modals/addMeetingModal";
import { supabase } from "../supabaseClient";
import ViewMeetingModal from "../modals/viewmeetingModal";
import useProfile from "../utils/useProfile";
import DebugRlsPanel from "../components/debugpanel";

// ───────────────── 스타일 ─────────────────

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  padding: 16px 16px 100px 16px;
  box-sizing: border-box;
  overflow-y: auto;
`;

const AddMeeting = styled.div`
  width: 60px;
  height: 60px;
  background-color: var(--Text-main);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  right: 30px;
  bottom: 150px;

  &:active {
    transition: all 0.15s;
    transform: var(--active-transform);
  }
`;

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const EmptyState = styled.div`
  font-size: 14px;
  color: var(--Text-sub);
  margin-top: 20px;
`;

const MeetingCard = styled.div`
  width: 100%;
  padding: 12px 14px;
  border-radius: 12px;
  background-color: var(--background-elevate);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 4px;

  &:active {
    transition: all 0.15s;
    transform: var(--active-transform);
    background-color: var(--background-lower);
  }
`;

const MeetingTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--Text-main);
`;

const MeetingMeta = styled.div`
  font-size: 12px;
  color: var(--Text-sub);
`;

const FilterBar = styled.div`
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
`;

const FilterChip = styled.div`
  flex: 1;
  height: 32px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 1px solid
    ${({ $active }) => ($active ? "var(--Text-main)" : "var(--background-btn)")};
  color: ${({ $active }) => ($active ? "var(--Text-main)" : "var(--Text-sub)")};
  background-color: ${({ $active }) =>
    $active ? "var(--background)" : "var(--background-lower)"};

  &:active {
    transform: var(--active-transform);
    background-color: var(--background-elevate);
  }
`;

// ───────────────── useMeetings 훅 ─────────────────

function useMeetings() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);

  // 오늘 00:00 기준 ISO
  const [rangeStart] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  });

  useEffect(() => {
    console.log(meetings);
  }, [meetings]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    (async () => {
      // 1) 오늘 이후 회의 + 참석자 조인
      const { data, error } = await supabase
        .from("meetings")
        .select("*, meeting_attendees ( user_id )")
        .gte("starts_at", rangeStart)
        .order("starts_at", { ascending: true });

      if (error) {
        console.error("[useMeetings] 초기 fetch 에러:", error);
        if (!cancelled) setMeetings([]);
        return;
      }
      if (!cancelled && data) {
        setMeetings(data);
      }
    })().finally(() => {
      if (!cancelled) setLoading(false);
    });

    // 2) realtime: meetings 테이블 변경 감지
    const channel = supabase
      .channel("meetings-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "meetings" },
        (payload) => {
          console.log("[meetings realtime] payload:", payload);

          let row = payload.new ?? payload.old;
          if (!row) return;
          if (!row.starts_at) return;

          const ts = new Date(row.starts_at);
          if (isNaN(+ts)) return;
          if (row.starts_at < rangeStart) return;

          setMeetings((prev) => {
            const map = new Map(prev.map((m) => [m.id, m]));

            if (payload.eventType === "DELETE") {
              map.delete(row.id);
            } else {
              // 기존에 저장돼 있던 meeting_attendees 유지 (payload.new에는 없음)
              const prevRow = map.get(row.id);
              if (prevRow && !row.meeting_attendees) {
                row = { ...row, meeting_attendees: prevRow.meeting_attendees };
              }
              map.set(row.id, row);
            }

            return Array.from(map.values()).sort(
              (a, b) =>
                new Date(a.starts_at).getTime() -
                new Date(b.starts_at).getTime()
            );
          });
        }
      )
      .subscribe((status) => {
        console.log("[meetings realtime] channel status:", status);
      });

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [rangeStart]);

  useEffect(() => {
    const handler = (e) => {
      const m = e.detail;
      if (!m || !m.starts_at) return;

      // 오늘 이전 건은 무시 (기존 로직과 동일하게 유지)
      if (m.starts_at < rangeStart) return;

      setMeetings((prev) => {
        const map = new Map(prev.map((x) => [x.id, x]));

        // 이미 realtime으로 들어와 있으면 덮어쓰되, meeting_attendees 있으면 유지
        const prevRow = map.get(m.id);
        let nextRow = m;
        if (prevRow && !m.meeting_attendees && prevRow.meeting_attendees) {
          nextRow = { ...m, meeting_attendees: prevRow.meeting_attendees };
        }

        map.set(nextRow.id, nextRow);

        return Array.from(map.values()).sort(
          (a, b) =>
            new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
        );
      });
    };

    window.addEventListener("meeting:created", handler);
    return () => window.removeEventListener("meeting:created", handler);
  }, [rangeStart]);

  return { meetings, loading };
}

// ───────────────── MeetingPage 컴포넌트 ─────────────────

export default function MeetingPage() {
  const { openModal } = useModal();
  const { meetings, loading } = useMeetings();
  const { profile, loading: profileLoading } = useProfile();

  const [viewMode, setViewMode] = useState("all"); // 'all' | 'mine'
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) return;
      setCurrentUserId(data.user.id);
    })();
  }, []);

  const canCreateMeeting = (() => {
    if (!profile) return false;
    // role HEAD → 부장
    if (profile.role === "HEAD") return true;
    // 회장단은 department가 "회장단"이면 전부 허용
    if (profile.department === "회장단") return true;
    return false;
  })();

  // 🔹 "내가 포함된 회의" 필터: 내가 만든 회의 + 참석자로 들어간 회의
  const filteredMeetings = useMemo(() => {
    if (viewMode === "all") return meetings;
    if (!currentUserId) return [];

    const myAuthId = currentUserId;
    const myProfileId = profile?.id ?? null;

    return meetings.filter((m) => {
      // 1) 내가 만든 회의
      if (myAuthId && m.created_by === myAuthId) return true;

      // 2) 참석자로 포함된 회의 (meeting_attendees.user_id 기준)
      const attendees = m.meeting_attendees ?? [];
      return attendees.some(
        (a) =>
          (myAuthId && a.user_id === myAuthId) ||
          (myProfileId && a.user_id === myProfileId)
      );
    });
  }, [viewMode, meetings, currentUserId, profile]);

  const addMeetingModal = {
    title: "회의 예약",
    child: AddMeetingModal,
  };

  const handleMeetingClick = (meeting) => {
    openModal(
      {
        title: "회의 상세",
        child: ViewMeetingModal,
        childProps: { meetingId: meeting.id },
      },
      {
        width: "350px",
        height: 580,
      }
    );
  };

  const formatTimeRange = (m) => {
    const start = new Date(m.starts_at);
    const end = m.ends_at ? new Date(m.ends_at) : null;

    const pad = (n) => String(n).padStart(2, "0");

    const dateText = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(
      start.getDate()
    )}`;

    const startTime = `${pad(start.getHours())}:${pad(start.getMinutes())}`;
    const endTime = end
      ? `${pad(end.getHours())}:${pad(end.getMinutes())}`
      : "";

    return endTime
      ? `${dateText} · ${startTime} ~ ${endTime}`
      : `${dateText} · ${startTime}`;
  };

  const meetingsToRender = viewMode === "mine" ? filteredMeetings : meetings;

  return (
    <Wrapper>
      {/* 🔽 필터 UI */}
      <FilterBar>
        <FilterChip
          $active={viewMode === "mine"}
          onClick={() => setViewMode("mine")}
        >
          내가 포함된 회의
        </FilterChip>
        <FilterChip
          $active={viewMode === "all"}
          onClick={() => setViewMode("all")}
        >
          전체 보기
        </FilterChip>
      </FilterBar>

      {/* 회의 리스트 */}
      {loading && meetingsToRender.length === 0 ? (
        <EmptyState>회의 정보를 불러오는 중입니다...</EmptyState>
      ) : meetingsToRender.length === 0 ? (
        <EmptyState>
          {viewMode === "mine"
            ? "내가 포함된 회의가 없습니다."
            : "예약된 회의가 없습니다."}
        </EmptyState>
      ) : (
        <ListWrapper>
          {meetingsToRender.map((m) => (
            <MeetingCard key={m.id} onClick={() => handleMeetingClick(m)}>
              <MeetingTitle>{m.title}</MeetingTitle>
              <MeetingMeta>{formatTimeRange(m)}</MeetingMeta>
              {m.description && <MeetingMeta>{m.description}</MeetingMeta>}
            </MeetingCard>
          ))}
        </ListWrapper>
      )}

      {/* 회의 추가 버튼 */}
      {canCreateMeeting && !profileLoading && (
        <AddMeeting
          onClick={() => {
            openModal(addMeetingModal, {
              width: "350px",
              height: 650,
            });
          }}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14 24H34"
              stroke="#000D26"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M24 14V34"
              stroke="#000D26"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </AddMeeting>
      )}
      {/* <DebugRlsPanel /> */}
    </Wrapper>
  );
}
