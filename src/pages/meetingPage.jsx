import styled from "styled-components";
import { useEffect, useState } from "react";
import { useModal } from "../components/modal";
import AddMeetingModal from "../modals/addMeetingModal";
import { supabase } from "../supabaseClient";
import ViewMeetingModal from "../modals/viewmeetingModal";

// ───────────────── 스타일 기본 골격 ─────────────────

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
    let cancelled = false;
    setLoading(true);

    // 1) 초기 fetch (오늘 이후 회의)
    supabase
      .from("meetings")
      .select("*")
      .gte("starts_at", rangeStart)
      .order("starts_at", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error("[useMeetings] 초기 fetch 에러:", error);
          return;
        }
        if (!cancelled && data) {
          setMeetings(data);
        }
      })
      .finally(() => !cancelled && setLoading(false));

    // 2) realtime 구독
    const channel = supabase
      .channel("meetings-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "meetings" },
        (payload) => {
          // INSERT / UPDATE / DELETE 모두 여기로 옴
          // payload.new / payload.old 안에 row 있음
          console.log("[meetings realtime] payload:", payload);

          let row = null;

          if (payload.eventType === "DELETE") {
            row = payload.old;
          } else {
            row = payload.new;
          }

          if (!row) return;

          // starts_at 없는 경우 스킵
          if (!row.starts_at) return;

          const ts = new Date(row.starts_at);
          if (isNaN(+ts)) return;

          // 오늘 이전 회의는 리스트에서 관리하지 않음
          if (row.starts_at < rangeStart) return;

          setMeetings((prev) => {
            const map = new Map(prev.map((m) => [m.id, m]));

            if (payload.eventType === "DELETE") {
              map.delete(row.id);
            } else {
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

  return { meetings, loading };
}

// ───────────────── MeetingPage 컴포넌트 ─────────────────

export default function MeetingPage() {
  const { openModal } = useModal();
  const { meetings, loading } = useMeetings();

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
        height: 580, // 적당히 조절
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

  return (
    <Wrapper>
      {/* 회의 리스트 */}
      {loading && meetings.length === 0 ? (
        <EmptyState>회의 정보를 불러오는 중입니다...</EmptyState>
      ) : meetings.length === 0 ? (
        <EmptyState>예약된 회의가 없습니다.</EmptyState>
      ) : (
        <ListWrapper>
          {meetings.map((m) => (
            <MeetingCard key={m.id} onClick={() => handleMeetingClick(m)}>
              <MeetingTitle>{m.title}</MeetingTitle>
              <MeetingMeta>{formatTimeRange(m)}</MeetingMeta>
              {m.description && <MeetingMeta>{m.description}</MeetingMeta>}
            </MeetingCard>
          ))}
        </ListWrapper>
      )}

      {/* 회의 추가 버튼 */}
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
    </Wrapper>
  );
}
