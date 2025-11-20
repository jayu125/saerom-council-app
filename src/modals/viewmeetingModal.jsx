// modals/viewMeetingModal.jsx
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { supabase } from "../supabaseClient";
import { useModal } from "../components/modal";
import { TitleInput, InputField } from "./addEventModal";
import { OrbitProgress } from "react-loading-indicators";

import dayjs from "dayjs";
import { LocalizationProvider, MobileTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DemoContainer, DemoItem } from "@mui/x-date-pickers/internals/demo";

// 🔹 참석자 선택/표시용
import AttendeeSelector from "../components/attendeeSelector";
import { useAllProfiles } from "../utils/useAllProfiles";

const timePickerSlotProps = {
  textField: {
    sx: {
      "& .MuiPickersInputBase-root": {
        color: "var(--Text-main)",
        borderColor: "var(--background-lower)",
      },
      "& .MuiPickersOutlinedInput-notchedOutline": {
        borderColor: "var(--background-lower) !important",
        borderWidth: "1px",
      },
      "& .MuiIconButton-root": {
        color: "var(--Text-sub);",
        padding: "6px",
        transition: "0.2s",
        "&:hover": {
          color: "var(--Text-sub);",
          backgroundColor: "rgba(25, 118, 210, 0.08)",
        },
      },
      "& .MuiPickersSectionList-root > span ": {
        fontWeight: 600,
      },
    },
    "& .MuiInputLabel-root": {
      color: "var(--Text-sub) !important",
      fontFamily: "pretendard variable",
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "var(--Text-main) !important",
    },
  },
  mobilePaper: {
    color: "var(--Text-main)",
    sx: {
      backgroundColor: "var(--background-elevate)",
      color: "var(--Text-main)",

      "& .MuiPickersToolbar-content span": {
        color: "var(--Text-sub)",
      },
      "& .MuiPickersToolbar-content span[data-selected]": {
        color: "var(--Text-main)",
      },

      "& .MuiClockNumber-root": {
        color: "var(--Text-main)",
        fontWeight: 200,
        fontFamily: "pretendard variable",
      },

      "& .MuiClock-pin, & .MuiClockPointer-root": {
        backgroundColor: "var(--Text-main)",
      },
      "& .MuiClockPointer-thumb": {
        borderColor: "var(--Text-main)",
        background: "var(--Text-main)",
      },

      "& .MuiClock-root": {
        backgroundColor: "var(--background-elevate)",
      },
      "& .MuiClock-clock": {
        backgroundColor: "var(--background-lower)",
      },

      "& .MuiDialogActions-root button": {
        color: "var(--Text-main)",
      },
    },
  },
};

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  padding-top: 10px;
  padding-bottom: 20px;
  box-sizing: border-box;
  position: relative;
  border-top: 1px dashed var(--Text-sub);
  user-select: none;
  padding-bottom: 88px;
`;

const Scrollable = styled.div`
  overflow-y: auto;
  width: 100%;
  height: 100%;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Section = styled.div`
  margin-top: 16px;
`;

const Label = styled.div`
  font-size: 11px;
  color: var(--Text-sub);
  margin-bottom: 4px;
`;

const TimeText = styled.div`
  font-size: 13px;
  color: var(--Text-main);
`;

const DescriptionText = styled.div`
  font-size: 13px;
  color: var(--Text-main);
  white-space: pre-wrap;
`;

const ButtonArea = styled.div`
  width: calc(100% - 60px);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
`;

const EditButton = styled.div`
  flex: 1;
  height: 48px;
  border-radius: 14px;
  background-color: var(--background-lower);
  color: var(--Text-main);
  font-size: 15px;
  font-weight: 600;
  display: flex;
  justify-content: center;
  align-items: center;

  &:active {
    transition: all 0.15s;
    transform: var(--active-transform);
    background-color: var(--background);
  }
`;

const DeleteButton = styled.div`
  flex: 1;
  height: 48px;
  border-radius: 14px;
  background-color: tomato;
  color: white;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  justify-content: center;
  align-items: center;

  &:active {
    transition: all 0.15s;
    transform: var(--active-transform);
    background-color: var(--background-elevate);
  }
`;

const CheckModal = styled.div`
  width: 100%;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  flex-direction: column;
  gap: 4px;
`;

const ConfirmButtonArea = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 8px;
`;

const CancelButton = styled.div`
  width: 100px;
  height: 42px;
  border-radius: 12px;
  background-color: var(--background-lower);
  font-size: 14px;
  font-weight: 600;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;

  &:active {
    transition: all 0.15s;
    transform: var(--active-transform);
    background-color: var(--background-elevate);
  }
`;

const EmptyArea = styled.div`
  height: 50px;
`;

const CheckButton = styled.div`
  width: 100px;
  height: 42px;
  border-radius: 12px;
  background-color: tomato;
  font-size: 14px;
  font-weight: 600;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;

  &:active {
    transition: all 0.15s;
    transform: var(--active-transform);
    background-color: var(--background-elevate);
  }
`;

const LoadingArea = styled.div`
  width: 64px;
  height: 64px;
  display: flex;
  justify-content: center;
  align-items: center;
  transform: scale(0.6);
`;

// meetingId를 childProps로 받는다고 가정
export default function ViewMeetingModal({ meetingId }) {
  const { closeModal } = useModal();

  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canEditOrDelete, setCanEditOrDelete] = useState(false);

  const [editMode, setEditMode] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // 🔹 참석자 ID 목록
  const [attendeeIds, setAttendeeIds] = useState([]);

  // 🔹 전체 프로필 (이름/부서 표시용)
  const { profiles } = useAllProfiles();

  const attendeeProfiles = useMemo(() => {
    if (!profiles || attendeeIds.length === 0) return [];
    const map = new Map(profiles.map((p) => [p.id, p]));
    return attendeeIds.map((id) => map.get(id)).filter(Boolean);
  }, [profiles, attendeeIds]);

  const pad = (n) => String(n).padStart(2, "0");

  const timeText = useMemo(() => {
    if (!meeting?.starts_at) return "";
    const start = new Date(meeting.starts_at);
    const end = meeting.ends_at ? new Date(meeting.ends_at) : null;

    const date = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(
      start.getDate()
    )}`;
    const s = `${pad(start.getHours())}:${pad(start.getMinutes())}`;
    const e = end ? `${pad(end.getHours())}:${pad(end.getMinutes())}` : "";

    return e ? `${date} · ${s} ~ ${e}` : `${date} · ${s}`;
  }, [meeting]);

  // 회의 정보 + 권한 + 참석자 로딩
  useEffect(() => {
    if (!meetingId) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);

        const [
          { data: userData, error: userError },
          { data, error },
          { data: ma, error: maErr },
        ] = await Promise.all([
          supabase.auth.getUser(),
          supabase.from("meetings").select("*").eq("id", meetingId).single(),
          supabase
            .from("meeting_attendees")
            .select("user_id")
            .eq("meeting_id", meetingId),
        ]);

        if (error) {
          console.log("ViewMeetingModal: 회의 조회 에러:", error);
          return;
        }
        if (cancelled) return;

        setMeeting(data);
        setTitle(data.title ?? "");
        setDescription(data.description ?? "");

        const s = data.starts_at ? dayjs(data.starts_at) : null;
        const e = data.ends_at ? dayjs(data.ends_at) : null;
        setStartTime(s);
        setEndTime(e ?? (s ? s.add(30, "minute") : null));

        const userId = userData?.user?.id;
        setCanEditOrDelete(Boolean(userId && data.created_by === userId));

        // 참석자 ID 세팅
        if (!maErr && ma) {
          const ids = ma.map((r) => r.user_id);
          setAttendeeIds(ids);
        }
      } catch (err) {
        console.log("ViewMeetingModal 초기 로딩 에러:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [meetingId]);

  const handleSave = async () => {
    if (!canEditOrDelete || !meetingId || !meeting) return;
    if (!title.trim()) {
      alert("회의 제목을 입력해주세요.");
      return;
    }
    if (!startTime || !endTime) {
      alert("시간을 선택해주세요.");
      return;
    }
    if (!dayjs(endTime).isAfter(dayjs(startTime))) {
      alert("종료 시간이 시작 시간보다 늦어야 합니다.");
      return;
    }

    try {
      setSaving(true);

      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData?.user) {
        throw userError ?? new Error("로그인이 필요합니다.");
      }
      const user = userData.user;

      // 날짜는 기존 날짜 유지, 시/분만 교체
      const baseDate = meeting.starts_at ? dayjs(meeting.starts_at) : dayjs();

      const newStart = baseDate
        .hour(startTime.hour())
        .minute(startTime.minute())
        .second(0)
        .millisecond(0);

      const newEnd = baseDate
        .hour(endTime.hour())
        .minute(endTime.minute())
        .second(0)
        .millisecond(0);

      // 1) meetings 업데이트
      const { error } = await supabase
        .from("meetings")
        .update({
          title: title.trim(),
          description: description.trim(),
          starts_at: newStart.toDate().toISOString(),
          ends_at: newEnd.toDate().toISOString(),
        })
        .eq("id", meetingId)
        .eq("created_by", user.id);

      if (error) {
        if (
          error.message?.includes("meetings_no_overlap") ||
          error.details?.includes("meetings_no_overlap")
        ) {
          alert("이미 해당 시간에 예약된 회의가 있습니다.");
        } else {
          console.log("ViewMeetingModal: 수정 중 에러:", error);
          alert("회의 정보를 수정하는 중 오류가 발생했습니다.");
        }
        return;
      }

      // 2) 참석자 업데이트
      try {
        // 기존 참석자 삭제
        const { error: delErr } = await supabase
          .from("meeting_attendees")
          .delete()
          .eq("meeting_id", meetingId);

        if (delErr) {
          console.error(
            "[ViewMeetingModal] meeting_attendees delete error:",
            delErr
          );
        }

        // 생성자는 반드시 참석자 목록에 포함되도록 보정
        const baseIds = new Set(attendeeIds);
        baseIds.add(meeting.created_by);
        const finalIds = Array.from(baseIds);

        if (finalIds.length > 0) {
          const rows = finalIds.map((uid) => ({
            meeting_id: meetingId,
            user_id: uid,
          }));
          const { error: insErr } = await supabase
            .from("meeting_attendees")
            .insert(rows);

          if (insErr) {
            console.error(
              "[ViewMeetingModal] meeting_attendees insert error:",
              insErr
            );
          }
        }
      } catch (eaErr) {
        console.error("[ViewMeetingModal] 참석자 업데이트 중 에러:", eaErr);
      }

      // 로컬 state도 업데이트
      setMeeting((prev) =>
        prev
          ? {
              ...prev,
              title: title.trim(),
              description: description.trim(),
              starts_at: newStart.toDate().toISOString(),
              ends_at: newEnd.toDate().toISOString(),
            }
          : prev
      );
      setEditMode(false);
    } catch (err) {
      console.log("ViewMeetingModal: 수정 중 에러:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!canEditOrDelete || !meetingId) return;

    try {
      setDeleting(true);

      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData?.user) {
        throw userError ?? new Error("로그인이 필요합니다.");
      }
      const user = userData.user;

      const { error } = await supabase
        .from("meetings")
        .delete()
        .eq("id", meetingId)
        .eq("created_by", user.id);

      if (error) throw error;

      window.dispatchEvent(
        new CustomEvent("meeting:deleted", { detail: { id: meetingId } })
      );

      closeModal();
    } catch (err) {
      console.log("ViewMeetingModal: 삭제 중 에러:", err);
      alert("회의를 삭제하는 중 오류가 발생했습니다.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Wrapper>
        <CheckModal>
          <LoadingArea>
            <OrbitProgress
              dense
              color="#ffffff"
              size="small"
              text=""
              textColor=""
            />
          </LoadingArea>
        </CheckModal>
      </Wrapper>
    );
  }

  if (!meeting) {
    return (
      <Wrapper>
        <CheckModal>
          <div>회의 정보를 불러올 수 없습니다.</div>
        </CheckModal>
      </Wrapper>
    );
  }

  if (deleteConfirmOpen) {
    return (
      <Wrapper>
        <CheckModal>
          <div>정말 이 회의를 삭제할까요?</div>
          <div style={{ fontSize: "12px", color: "var(--Text-sub)" }}>
            {meeting.title}
          </div>
          <ConfirmButtonArea>
            <CancelButton onClick={() => setDeleteConfirmOpen(false)}>
              취소
            </CancelButton>
            <CheckButton onClick={handleDelete}>
              {deleting ? (
                <LoadingArea>
                  <OrbitProgress
                    dense
                    color="#ffffff"
                    size="small"
                    text=""
                    textColor=""
                  />
                </LoadingArea>
              ) : (
                "삭제"
              )}
            </CheckButton>
          </ConfirmButtonArea>
        </CheckModal>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Scrollable>
        {/* 제목 */}
        <Section>
          {editMode ? (
            <TitleInput
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="회의 제목"
            />
          ) : (
            <TimeText>{meeting.title}</TimeText>
          )}
        </Section>

        {/* 시간 */}
        <Section>
          {editMode ? (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Label>시작 시간</Label>
              <DemoContainer
                components={["MobileTimePicker", "MobileTimePicker"]}
              >
                <DemoItem>
                  <MobileTimePicker
                    value={startTime}
                    onChange={(v) => v && setStartTime(v)}
                    slotProps={timePickerSlotProps}
                  />
                </DemoItem>
              </DemoContainer>
              <Label>종료 시간</Label>
              <DemoContainer
                components={["MobileTimePicker", "MobileTimePicker"]}
              >
                <DemoItem>
                  <MobileTimePicker
                    value={endTime}
                    onChange={(v) => v && setEndTime(v)}
                    slotProps={timePickerSlotProps}
                  />
                </DemoItem>
              </DemoContainer>
            </LocalizationProvider>
          ) : (
            <TimeText>{timeText}</TimeText>
          )}
        </Section>

        {/* 설명 */}
        <Section>
          {editMode ? (
            <InputField
              style={{ marginTop: 4 }}
              screenwidth={380}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="설명"
            />
          ) : meeting.description ? (
            <DescriptionText>{meeting.description}</DescriptionText>
          ) : (
            <DescriptionText style={{ color: "var(--Text-sub)" }}>
              설명 없음
            </DescriptionText>
          )}
        </Section>

        {/* 참석자 */}
        <Section>
          {editMode ? (
            <AttendeeSelector
              selectedIds={attendeeIds}
              onChange={setAttendeeIds}
            />
          ) : attendeeProfiles.length === 0 ? (
            <DescriptionText style={{ color: "var(--Text-sub)" }}>
              참석자 없음
            </DescriptionText>
          ) : (
            <DescriptionText>
              {attendeeProfiles
                .map((p) =>
                  p.department ? `${p.name} (${p.department})` : p.name
                )
                .join(", ")}
            </DescriptionText>
          )}
        </Section>
        <EmptyArea></EmptyArea>

        {!canEditOrDelete && (
          <Section>
            <Label>권한</Label>
            <DescriptionText style={{ color: "var(--Text-sub)" }}>
              이 회의의 생성자가 아니어서 수정/삭제할 수 없습니다.
            </DescriptionText>
          </Section>
        )}
      </Scrollable>

      {canEditOrDelete && (
        <ButtonArea>
          <EditButton onClick={editMode ? handleSave : () => setEditMode(true)}>
            {editMode ? (saving ? "저장 중..." : "저장") : "수정"}
          </EditButton>
          <DeleteButton onClick={() => setDeleteConfirmOpen(true)}>
            삭제
          </DeleteButton>
        </ButtonArea>
      )}
    </Wrapper>
  );
}
