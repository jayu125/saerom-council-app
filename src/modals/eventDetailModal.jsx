// src/modals/EventDetailModal.jsx
import { useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import { supabase } from "../supabaseClient";
import { useModal } from "../components/modal";
import { TitleInput, InputField } from "./addEventModal";

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 16px 16px 80px 16px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Tabs = styled.div`
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
`;

const Tab = styled.div`
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

const SectionTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--Text-main);
  margin-bottom: 8px;
`;

const FieldRow = styled.div`
  font-size: 13px;
  color: var(--Text-main);
  margin-bottom: 6px;
`;

const FieldLabel = styled.span`
  color: var(--Text-sub);
  margin-right: 4px;
`;

const BadgeRow = styled.div`
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
`;

const Badge = styled.span`
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 11px;
  color: var(--Text-main);
  background-color: var(--background-lower);
`;

const DangerText = styled.div`
  font-size: 12px;
  color: #f97373;
  line-height: 1.5;
  margin-bottom: 16px;
`;

const ButtonRow = styled.div`
  position: absolute;
  bottom: 16px;
  left: 16px;
  right: 16px;
  display: flex;
  gap: 6px;
`;

const PrimaryButton = styled.div`
  flex: 1;
  height: 48px;
  border-radius: 14px;
  background-color: var(--background);
  color: var(--Text-main);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  &:active {
    transform: var(--active-transform);
    background-color: var(--background-lower);
  }
`;

const SecondaryButton = styled.div`
  flex: 1;
  height: 48px;
  border-radius: 14px;
  background-color: var(--background-btn);
  color: var(--Text-main);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  &:active {
    transform: var(--active-transform);
    background-color: var(--background-lower);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 80px;
  border-radius: 12px;
  border: 1px solid var(--background-btn);
  background-color: var(--background-elevate);
  color: var(--Text-main);
  padding: 10px 12px;
  font-size: 13px;
  box-sizing: border-box;
  resize: vertical;
  outline: none;
`;

const VisibilityChips = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 10px;
`;

const VisibilityChip = styled.div`
  flex: 1;
  height: 30px;
  border-radius: 999px;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 1px solid
    ${({ $active }) => ($active ? "var(--Text-main)" : "var(--background-btn)")};
  color: ${({ $active }) => ($active ? "var(--Text-main)" : "var(--Text-sub)")};
  background-color: ${({ $active }) =>
    $active ? "var(--background)" : "var(--background-lower)"};
`;

function formatDateRange(ev) {
  if (!ev?.starts_at) return "";
  const start = new Date(ev.starts_at);
  const end = ev.ends_at ? new Date(ev.ends_at) : null;

  const pad = (n) => String(n).padStart(2, "0");

  const dateText = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(
    start.getDate()
  )}`;

  const startTime = `${pad(start.getHours())}:${pad(start.getMinutes())}`;
  const endTime = end ? `${pad(end.getHours())}:${pad(end.getMinutes())}` : "";

  if (ev.all_day) {
    return `${dateText} · 종일`;
  }

  return endTime
    ? `${dateText} · ${startTime} ~ ${endTime}`
    : `${dateText} · ${startTime}`;
}

/**
 * props:
 *  - eventId: string
 * 캘린더에서 일정 클릭 시 사용하는 상세 모달
 * 세부정보 / 수정 / 삭제 탭을 가지며
 * 회의에서 생성된 이벤트인 경우 삭제 탭은 숨긴다.
 */
export default function EventDetailModal({ eventId }) {
  const { closeModal, openModal } = useModal();
  const [tab, setTab] = useState("info"); // 'info' | 'edit' | 'delete'
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("public");

  const [isOwner, setIsOwner] = useState(false);
  const [isMeetingLinked, setIsMeetingLinked] = useState(false);

  // 이벤트 + meetings join해서 가져오기
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);

      // 현재 유저
      const { data: userData } = await supabase.auth.getUser();
      const authId = userData?.user?.id ?? null;

      const { data, error } = await supabase
        .from("events")
        .select("*, meetings(*)")
        .eq("id", eventId)
        .maybeSingle();

      if (error) {
        console.error("[EventDetailModal] fetch error:", error);
        if (!cancelled) {
          setEvent(null);
        }
        return;
      }

      if (!cancelled && data) {
        setEvent(data);
        setTitle(data.title ?? "");
        setDescription(data.description ?? "");
        setVisibility(data.visibility ?? "public");

        // 작성자 여부
        setIsOwner(authId && data.user_id === authId);

        // meetings 연결 여부 (회의에서 생성된 일정인지)
        const hasMeeting =
          Array.isArray(data.meetings) && data.meetings.length > 0;
        setIsMeetingLinked(hasMeeting);
      }
    })().finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const visibilityLabel = useMemo(() => {
    if (!event) return "";
    const v = event.visibility ?? "public";
    if (v === "private") return "나만 보기";
    if (v === "attendees") return "참석자에게만 공개";
    return "모두에게 공개";
  }, [event]);

  const handleSave = async () => {
    if (!event || !isOwner) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("events")
        .update({
          title: title.trim(),
          description: description.trim(),
          visibility,
        })
        .eq("id", event.id);

      if (error) {
        console.error("[EventDetailModal] update error:", error);
        alert("일정 수정 중 오류가 발생했습니다.");
        return;
      }
      alert("일정이 수정되었습니다.");
      closeModal();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!event || !isOwner || isMeetingLinked) return;

    const ok = window.confirm("정말 이 일정을 삭제하시겠습니까?");
    if (!ok) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", event.id);

      if (error) {
        console.error("[EventDetailModal] delete error:", error);
        alert("일정 삭제 중 오류가 발생했습니다.");
        return;
      }
      alert("일정이 삭제되었습니다.");
      closeModal();
    } finally {
      setSaving(false);
    }
  };

  if (loading || !event) {
    return (
      <Wrapper>
        <div style={{ fontSize: 13, color: "var(--Text-sub)" }}>
          일정을 불러오는 중입니다...
        </div>
      </Wrapper>
    );
  }

  // 탭 구성: 세부정보는 항상 있고, 수정/삭제는 권한과 meeting 연동 여부에 따라
  const tabs = [
    { id: "info", label: "세부정보" },
    ...(isOwner ? [{ id: "edit", label: "수정" }] : []),
    ...(isOwner && !isMeetingLinked ? [{ id: "delete", label: "삭제" }] : []),
  ];

  return (
    <Wrapper>
      <Tabs>
        {tabs.map((t) => (
          <Tab key={t.id} $active={tab === t.id} onClick={() => setTab(t.id)}>
            {t.label}
          </Tab>
        ))}
      </Tabs>

      {/* -------- 세부정보 탭 -------- */}
      {tab === "info" && (
        <>
          <BadgeRow>
            {event.all_day && <Badge>종일</Badge>}
            {isMeetingLinked && <Badge>회의에서 생성됨</Badge>}
            <Badge>{visibilityLabel}</Badge>
          </BadgeRow>

          <SectionTitle>{event.title}</SectionTitle>

          <FieldRow>
            <FieldLabel>시간</FieldLabel>
            <span>{formatDateRange(event)}</span>
          </FieldRow>

          {event.location && (
            <FieldRow>
              <FieldLabel>장소</FieldLabel>
              <span>{event.location}</span>
            </FieldRow>
          )}

          {event.description && (
            <FieldRow style={{ marginTop: 12 }}>
              <FieldLabel>설명</FieldLabel>
              <div style={{ marginTop: 4 }}>{event.description}</div>
            </FieldRow>
          )}

          {isMeetingLinked && (
            <DangerText style={{ marginTop: 16 }}>
              이 일정은 &ldquo;회의&rdquo;에서 자동으로 생성된 일정입니다.
              <br />
              삭제는 회의 탭에서 회의 자체를 삭제해야 합니다.
            </DangerText>
          )}
        </>
      )}

      {/* -------- 수정 탭 -------- */}
      {tab === "edit" && isOwner && (
        <>
          <SectionTitle>제목</SectionTitle>
          <TitleInput
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="일정 제목"
          />

          <SectionTitle style={{ marginTop: 20 }}>설명</SectionTitle>
          <TextArea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="설명 (선택)"
          />

          <SectionTitle style={{ marginTop: 20 }}>공개 범위</SectionTitle>
          <VisibilityChips>
            <VisibilityChip
              $active={visibility === "private"}
              onClick={() => setVisibility("private")}
            >
              나만 보기
            </VisibilityChip>
            <VisibilityChip
              $active={visibility === "attendees"}
              onClick={() => setVisibility("attendees")}
            >
              참석자만
            </VisibilityChip>
            <VisibilityChip
              $active={visibility === "public"}
              onClick={() => setVisibility("public")}
            >
              모두
            </VisibilityChip>
          </VisibilityChips>

          <ButtonRow>
            <SecondaryButton onClick={() => setTab("info")}>
              취소
            </SecondaryButton>
            <PrimaryButton onClick={handleSave}>
              {saving ? "저장 중..." : "저장"}
            </PrimaryButton>
          </ButtonRow>
        </>
      )}

      {/* -------- 삭제 탭 -------- */}
      {tab === "delete" && isOwner && !isMeetingLinked && (
        <>
          <SectionTitle>일정 삭제</SectionTitle>
          <DangerText>
            이 일정을 완전히 삭제합니다.
            <br />
            되돌릴 수 없으니 신중히 진행해주세요.
          </DangerText>

          <ButtonRow>
            <SecondaryButton onClick={() => setTab("info")}>
              취소
            </SecondaryButton>
            <PrimaryButton onClick={handleDelete}>
              {saving ? "삭제 중..." : "완전 삭제"}
            </PrimaryButton>
          </ButtonRow>
        </>
      )}
    </Wrapper>
  );
}
