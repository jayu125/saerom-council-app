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
        color: "var(--Text-sub);", // 기본 아이콘 색상
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
      color: "var(--Text-sub) !important", // 기본 label 색
      fontFamily: "pretendard variable",
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "var(--Text-main) !important", // 클릭/포커스 시 label 색
    },
  },
  mobilePaper: {
    color: "var(--Text-main)",
    sx: {
      // 전체 다이얼로그 배경
      backgroundColor: "var(--background-elevate)",
      color: "var(--Text-main)",

      // 툴바의 큰 시간 글자
      "& .MuiPickersToolbar-content span": {
        color: "var(--Text-sub)",
      },
      "& .MuiPickersToolbar-content span[data-selected]": {
        color: "var(--Text-main)",
      },

      // 시계 숫자
      "& .MuiClockNumber-root": {
        color: "var(--Text-main)",
        fontWeight: 200,
        fontFamily: "pretendard variable",
      },

      // 시계 침
      "& .MuiClock-pin, & .MuiClockPointer-root": {
        backgroundColor: "var(--Text-main)",
      },
      "& .MuiClockPointer-thumb": {
        borderColor: "var(--Text-main)",
        background: "var(--Text-main)",
      },

      // 선택된 숫자
      "& .MuiClockNumber-root.Mui-selected": {
        color: "var(--background-elevate)",
      },

      // 시계 배경
      "& .MuiClock-root": {
        backgroundColor: "var(--background-elevate)",
      },
      "& .MuiClock-clock": {
        backgroundColor: "var(--background-lower)",
      },

      // 확인/취소 버튼
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
  padding: 0 30px;
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

  // 회의 정보 + 권한 확인
  useEffect(() => {
    if (!meetingId) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);

        const [{ data: userData, error: userError }, { data, error }] =
          await Promise.all([
            supabase.auth.getUser(),
            supabase.from("meetings").select("*").eq("id", meetingId).single(),
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
    if (!canEditOrDelete || !meetingId) return;
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

      // 날짜 부분은 기존 starts_at 기준으로 유지하고, 시/분만 교체
      const baseDate = meeting.starts_at ? dayjs(meeting.starts_at) : dayjs(); // fallback

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
          <Label>회의 제목</Label>
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
          <Label>시간</Label>
          {editMode ? (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer
                components={["MobileTimePicker", "MobileTimePicker"]}
              >
                <DemoItem>
                  <MobileTimePicker
                    value={startTime}
                    onChange={(v) => v && setStartTime(v)}
                    slotProps={timePickerSlotProps} // ✅ 추가
                  />
                </DemoItem>
                <DemoItem>
                  <MobileTimePicker
                    value={endTime}
                    onChange={(v) => v && setEndTime(v)}
                    slotProps={timePickerSlotProps} // ✅ 추가
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
          <Label>설명</Label>
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
