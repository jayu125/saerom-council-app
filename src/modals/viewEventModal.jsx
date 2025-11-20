// src/modals/viewEventModal.jsx
import styled from "styled-components";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import { TitleInput, InputField } from "./addEventModal";
import { useModal } from "../components/modal";
import { useAllProfiles } from "../utils/useAllProfiles";
import AttendeeSelector from "../components/attendeeSelector";

/* ───────────── 공통 스타일 ───────────── */

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 0 80px 0;
`;

const EmptyState = styled.div`
  font-size: 13px;
  color: var(--Text-sub);
  margin-top: 16px;
`;

const Item = styled.div`
  width: 100%;
  height: 60px;
  display: flex;
  box-sizing: border-box;
  padding: 10px 0px;
  border-radius: 10px;
  &:active {
    transition: all 0.15s;
    transform: var(--active-transform);
    background-color: var(--background-lower);
  }
`;

const LeftBox = styled.div`
  width: 60px;
  position: relative;
`;

const MidBox = styled.div`
  width: 18px;
  position: relative;
`;

const RightBox = styled.div`
  width: 100%;
  position: relative;
`;

const Title = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: var(--Text-main);
  top: 1px;
  position: absolute;
`;

const Meta = styled.div`
  font-size: 10px;
  color: var(--Text-sub);
  position: absolute;
  top: 22px;
`;

const Time = styled.div`
  font-size: 12px;
  color: var(--Text-main);
  font-weight: 600;
  position: absolute;
  top: 3px;
  left: 5px;
`;

const ColorMeta = styled.div`
  width: 4px;
  height: 50%;
  position: absolute;
  top: 0;
  border-radius: 2px;
  background-color: ${({ $color }) => $color};
`;

/* ───────────── 상세 모달 스타일 ───────────── */

const DetailWrapper = styled.div`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding-bottom: 80px;
  overflow-y: auto;
  padding: 20px 30px 120px 30px;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Section = styled.div`
  margin-top: 20px;
`;

const SectionLabel = styled.div`
  font-size: 12px;
  font-weight: 400;
  color: var(--Text-sub);
  margin-bottom: 8px;
`;

const DetailTitle = styled.div`
  font-size: 22px;
  font-weight: 600;
  color: var(--Text-main);
`;

const ValueText = styled.div`
  font-size: 14px;
  color: var(--Text-main);
  font-weight: 400;
  white-space: pre-wrap;
`;

const ButtonRow = styled.div`
  position: absolute;
  bottom: 36px;
  left: 30px;
  right: 30px;
  display: flex;
  gap: 6px;
`;

const SecondaryButton = styled.button`
  flex: 1;
  height: 46px;
  border-radius: 12px;
  border: none;
  background-color: var(--background-btn);
  color: var(--Text-main);
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active {
    transform: var(--active-transform);
    background-color: var(--background-lower);
  }
`;

const PrimaryButton = styled.button`
  flex: 1;
  height: 46px;
  border-radius: 12px;
  border: none;
  background-color: #f97373;
  color: var(--Text-main);
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active {
    transform: var(--active-transform);
    background-color: var(--background-elevate);
  }

  &:disabled {
    opacity: 0.4;
    transform: none;
  }
`;

const DangerTextButton = styled.button`
  margin-top: 6px;
  border: none;
  background: transparent;
  color: #f97373;
  font-size: 12px;
  font-weight: 500;
  padding: 0;
  text-align: right;
  width: 100%;

  &:active {
    transform: var(--active-transform);
  }
`;

/* ───────────── 유틸 ───────────── */

function formatDateTimeRange(ev) {
  if (!ev?.starts_at) return "";

  const s = new Date(ev.starts_at);
  const e = ev.ends_at ? new Date(ev.ends_at) : null;

  const pad = (n) => String(n).padStart(2, "0");

  const dateText = `${s.getFullYear()}-${pad(s.getMonth() + 1)}-${pad(
    s.getDate()
  )}`;
  const sTime = `${pad(s.getHours())}:${pad(s.getMinutes())}`;
  const eTime = e ? `${pad(e.getHours())}:${pad(e.getMinutes())}` : "";

  return eTime ? `${dateText} · ${sTime} ~ ${eTime}` : `${dateText} · ${sTime}`;
}

function visibilityLabel(v) {
  if (v === "private") return "나만 보기";
  if (v === "attendees") return "참석자에게만 공개";
  return "모두에게 공개";
}

/* ───────────── 1) 날짜별 이벤트 리스트 (기본 모달) ───────────── */

export default function ViewEventModalChild({
  date,
  events = [],
  setter,
  setSelectedEventId,
}) {
  const [selected, setSelected] = useState("");
  const sortedEvents = useMemo(
    () =>
      [...events].sort(
        (a, b) =>
          new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
      ),
    [events]
  );

  const onEventClick = async (ev) => {
    if (selected === ev.id) {
      setSelected("");
      setter(false);
    } else {
      await setter(false);
      setSelectedEventId(ev.id);
      setSelected(ev.id);
      setter(true);
    }
  };

  if (!date) {
    return <EmptyState>날짜 정보가 없습니다.</EmptyState>;
  }

  return (
    <div style={{ position: "relative", height: "100%", overflowY: "scroll" }}>
      {sortedEvents.length === 0 ? (
        <EmptyState>이 날에는 등록된 일정이 없습니다.</EmptyState>
      ) : (
        <ListWrapper>
          {sortedEvents.map((ev) => {
            const s = new Date(ev.starts_at);
            const hh = String(s.getHours()).padStart(2, "0");
            const mm = String(s.getMinutes()).padStart(2, "0");

            return (
              <Item
                style={
                  selected === ev.id
                    ? { backgroundColor: "var(--background-lower) !important" }
                    : null
                }
                key={ev.id}
                onClick={() => onEventClick(ev)}
              >
                <LeftBox>
                  <Time>
                    {hh}:{mm}
                  </Time>
                </LeftBox>

                <MidBox>
                  <ColorMeta $color={ev.color} />
                </MidBox>

                <RightBox>
                  <Title>{ev.title}</Title>

                  <Meta>
                    {ev.location ?? "장소 없음"} •{" "}
                    {ev.description && ev.description.length > 20
                      ? ev.description.slice(0, 20) + "…"
                      : ev.description ?? "설명 없음"}
                  </Meta>
                </RightBox>
              </Item>
            );
          })}
        </ListWrapper>
      )}
    </div>
  );
}

/* ───────────── 2) 확장 모달: 일정 상세 / 수정 / 삭제 ───────────── */

export function EventDetailModalChild({ selectedEventId, closeExpend }) {
  const { closeModal } = useModal(); // 삭제 후 전체 모달 닫을 용도
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isMeetingEvent, setIsMeetingEvent] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const [attendeeIds, setAttendeeIds] = useState([]);
  const { profiles } = useAllProfiles();

  const attendeeProfiles = useMemo(() => {
    if (!profiles || attendeeIds.length === 0) return [];
    const map = new Map(profiles.map((p) => [p.id, p]));
    return attendeeIds.map((id) => map.get(id)).filter(Boolean);
  }, [profiles, attendeeIds]);

  useEffect(() => {
    if (!selectedEventId) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);

        // 1) 현재 유저
        const { data: userData, error: userErr } =
          await supabase.auth.getUser();
        if (!cancelled && !userErr && userData?.user) {
          setCurrentUserId(userData.user.id);
        }

        // 2) 이벤트 조회
        const { data: ev, error } = await supabase
          .from("events")
          .select("*")
          .eq("id", selectedEventId)
          .single();

        if (error) {
          console.error("[EventDetailModalChild] event fetch error:", error);
          return;
        }

        if (!cancelled && ev) {
          setEvent(ev);
          setEditTitle(ev.title ?? "");
          setEditDesc(ev.description ?? "");
        }

        // 3) 이 이벤트가 meetings 와 연결된 일정인지 확인
        const { data: meetingRow, error: meetingErr } = await supabase
          .from("meetings")
          .select("id")
          .eq("event_id", selectedEventId)
          .maybeSingle();

        if (!cancelled && !meetingErr && meetingRow) {
          setIsMeetingEvent(true);
        }

        // 4) event_attendees 우선 조회
        const { data: ea, error: eaErr } = await supabase
          .from("event_attendees")
          .select("user_id")
          .eq("event_id", selectedEventId);

        let ids = [];
        if (!eaErr && ea) {
          ids = ea.map((r) => r.user_id);
        }

        // 5) meeting과 연결 + event_attendees 비어 있으면 meeting_attendees로 fallback
        if (meetingRow && ids.length === 0) {
          const { data: ma, error: maErr } = await supabase
            .from("meeting_attendees")
            .select("user_id")
            .eq("meeting_id", meetingRow.id);
          if (!maErr && ma) {
            ids = ma.map((r) => r.user_id);
          }
        }

        if (!cancelled) {
          setAttendeeIds(ids);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedEventId]);

  const isOwner =
    event && currentUserId ? event.user_id === currentUserId : false;

  // 회의와 연결된 이벤트는 여전히 수정/삭제 불가
  const canEdit = isOwner && !isMeetingEvent;
  const canDelete = isOwner && !isMeetingEvent;

  // 참석자 수정 가능 여부 (일반 일정만)
  const canEditAttendees = canEdit;

  const handleSave = async () => {
    if (!event || !canEdit) return;
    if (!editTitle.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    try {
      setSaving(true);

      // 1) 이벤트 기본 정보 업데이트
      const updates = {
        title: editTitle.trim(),
        description: editDesc.trim(),
      };

      const { error } = await supabase
        .from("events")
        .update(updates)
        .eq("id", event.id);

      if (error) {
        console.error("[EventDetailModalChild] update error:", error);
        alert("일정 수정 중 오류가 발생했습니다.");
        return;
      }

      // 2) 참석자 업데이트 (일반 일정만)
      if (canEditAttendees) {
        // 기존 참석자 전부 삭제 후 새로 insert
        const { error: delErr } = await supabase
          .from("event_attendees")
          .delete()
          .eq("event_id", event.id);

        if (delErr) {
          console.error(
            "[EventDetailModalChild] event_attendees delete error:",
            delErr
          );
        }

        if (attendeeIds.length > 0) {
          const rows = attendeeIds.map((uid) => ({
            event_id: event.id,
            user_id: uid,
          }));
          const { error: insErr } = await supabase
            .from("event_attendees")
            .insert(rows);

          if (insErr) {
            console.error(
              "[EventDetailModalChild] event_attendees insert error:",
              insErr
            );
          }
        }
      }

      // 로컬 상태 반영
      setEvent((prev) =>
        prev
          ? {
              ...prev,
              ...updates,
            }
          : prev
      );
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!event || !canDelete) return;

    const ok = window.confirm("정말 이 일정을 삭제하시겠습니까?");
    if (!ok) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", event.id);

      if (error) {
        console.error("[EventDetailModalChild] delete error:", error);
        alert("일정 삭제 중 오류가 발생했습니다.");
        return;
      }

      // 삭제 후 전체 모달 닫기 (달력은 realtime으로 갱신됨)
      closeModal();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DetailWrapper>
        <Section>
          <ValueText style={{ fontSize: 12, color: "var(--Text-sub)" }}>
            일정을 불러오는 중입니다...
          </ValueText>
        </Section>
      </DetailWrapper>
    );
  }

  if (!event) {
    return (
      <DetailWrapper>
        <Section>
          <ValueText style={{ fontSize: 12, color: "var(--Text-sub)" }}>
            일정을 찾을 수 없습니다.
          </ValueText>
        </Section>
        <ButtonRow>
          <SecondaryButton onClick={closeExpend}>닫기</SecondaryButton>
        </ButtonRow>
      </DetailWrapper>
    );
  }

  return (
    <DetailWrapper>
      {/* 제목 / 설명 */}
      {isEditing ? (
        <>
          <Section>
            <TitleInput
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="일정 제목"
            />
          </Section>
          <Section>
            <InputField
              style={{ marginTop: 4 }}
              screenwidth={380}
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              placeholder="설명"
            />
          </Section>
          {canEditAttendees && (
            <Section style={{ marginTop: 24 }}>
              <AttendeeSelector
                selectedIds={attendeeIds}
                onChange={setAttendeeIds}
              />
            </Section>
          )}
        </>
      ) : (
        <>
          <Section>
            <DetailTitle>{event.title || "제목 없음"}</DetailTitle>
          </Section>
          <Section style={{ marginTop: 30 }}>
            <SectionLabel>설명</SectionLabel>
            <ValueText>{event.description || "설명 없음"}</ValueText>
          </Section>
        </>
      )}

      {/* 시간 */}
      <Section>
        <SectionLabel>시간</SectionLabel>
        <ValueText>{formatDateTimeRange(event)}</ValueText>
      </Section>

      {/* 공개 범위 */}
      <Section>
        <SectionLabel>공개 범위</SectionLabel>
        <ValueText>{visibilityLabel(event.visibility)}</ValueText>
      </Section>

      {/* 참석자 */}
      <Section>
        <SectionLabel>참석자</SectionLabel>
        {attendeeProfiles.length === 0 ? (
          <ValueText style={{ fontSize: 15 }}>
            지정된 참석자가 없습니다.
          </ValueText>
        ) : (
          <ValueText style={{ fontSize: 15 }}>
            {attendeeProfiles
              .map((p) =>
                p.department ? `${p.name} (${p.department})` : p.name
              )
              .join(", ")}
          </ValueText>
        )}
      </Section>

      {/* 회의 일정 안내 */}
      {isMeetingEvent && (
        <Section>
          <ValueText style={{ fontSize: 13, color: "var(--Text-sub)" }}>
            이 일정은 회의 예약과 연결된 일정입니다.
            <br />
            회의 탭에서만 삭제할 수 있으며, 여기서는 삭제할 수 없습니다.
          </ValueText>
        </Section>
      )}

      {/* 버튼들 */}
      <ButtonRow>
        {/* <SecondaryButton onClick={closeExpend} disabled={saving}>
          닫기
        </SecondaryButton> */}

        {canEdit && (
          <SecondaryButton
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            disabled={saving}
          >
            {isEditing ? (saving ? "저장 중..." : "저장") : "수정"}
          </SecondaryButton>
        )}
        {canDelete && (
          <PrimaryButton onClick={handleDelete} disabled={saving}>
            삭제
          </PrimaryButton>
        )}
      </ButtonRow>

      {/* 삭제 버튼: 회의 일정이면 안 보임 */}
      {/* {canDelete && (
        <DangerTextButton onClick={handleDelete} disabled={saving}>
          일정 삭제
        </DangerTextButton>
      )} */}
    </DetailWrapper>
  );
}
