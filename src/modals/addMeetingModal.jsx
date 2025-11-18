// modals/addMeetingModal.jsx
import styled from "styled-components";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { InputField, TitleInput } from "./addEventModal";
import { supabase } from "../supabaseClient";
import { useModal } from "../components/modal";

import dayjs from "dayjs";
import { LocalizationProvider, MobileTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DemoContainer, DemoItem } from "@mui/x-date-pickers/internals/demo";

// 파일 상단 어딘가 (import들 아래 정도)
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
  box-sizing: border-box;
  overflow-y: scroll;
  scroll-behavior: smooth;
  overscroll-behavior: contain;
  position: relative;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const NextButton = styled.div`
  width: 100%;
  height: 54px;
  background-color: ${({ isallowed }) =>
    isallowed === "true" ? "var(--background)" : "var(--background-btn)"};
  color: ${({ isallowed }) =>
    isallowed === "true" ? "var(--Text-main)" : "var(--Text-sub)"};
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 15px;
  font-weight: 500;
  transition: all 0.2s;

  &:active {
    transform: ${({ isallowed }) =>
      isallowed === "true" ? "var(--active-transform)" : null};
    background-color: var(--background-lower);
  }
`;

const PrevButton = styled.div`
  width: 100%;
  height: 54px;
  background-color: var(--background-btn);
  color: var(--Text-main);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 15px;
  font-weight: 500;
  transition: all 0.2s;

  &:active {
    transform: var(--active-transform);
    background-color: var(--background-lower);
  }
`;

const ButtonWrap = styled.div`
  position: absolute;
  bottom: 80px;
  display: flex;
  width: 100%;
  gap: 6px;
  box-sizing: border-box;
`;

const SectionTitle = styled.p`
  font-size: 18px;
  font-weight: 600;
  color: var(--Text-main);
  margin: 20px 0 10px 0;
`;

const TimePickerRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SummaryText = styled.div`
  padding: 16px 0px 0 0px;
  font-size: 13px;
  color: var(--Text-sub);
`;

const LoadingArea = styled.div`
  width: 64px;
  height: 64px;
  display: flex;
  justify-content: center;
  align-items: center;
  transform: scale(0.5);
`;

export default function AddMeetingModal() {
  const [date, setDate] = useState(new Date());
  const [currentStep, setCurrentStep] = useState(0);

  const [startTime, setStartTime] = useState(dayjs().hour(16).minute(0));
  const [endTime, setEndTime] = useState(dayjs().hour(16).minute(30));

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [allowBtn, setAllowBtn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { closeModal } = useModal();

  // 날짜+TimePicker 조합해서 Dayjs 시작/끝 시간 만들기
  function buildMeetingTimeRange(date, startTime, endTime) {
    const base = dayjs(date);

    const start = base
      .hour(startTime.hour())
      .minute(startTime.minute())
      .second(0)
      .millisecond(0);

    const end = base
      .hour(endTime.hour())
      .minute(endTime.minute())
      .second(0)
      .millisecond(0);

    return { startsAt: start, endsAt: end };
  }

  const onTitleChange = (e) => setTitle(e.target.value);
  const onDescChange = (e) => setDescription(e.target.value);

  // 단계별로 '다음 / 예약' 버튼 활성화 판단
  useEffect(() => {
    if (currentStep === 0) {
      setAllowBtn(!!date);
    } else if (currentStep === 1) {
      const valid =
        startTime && endTime && dayjs(endTime).isAfter(dayjs(startTime)); // 종료 > 시작
      setAllowBtn(valid);
    } else if (currentStep === 2) {
      setAllowBtn(title.trim() !== "");
    } else {
      setAllowBtn(false);
    }
  }, [currentStep, date, startTime, endTime, title]);

  const onNextBtnClick = () => {
    if (!allowBtn) return;
    if (currentStep < 2) {
      setCurrentStep((prev) => prev + 1);
    } else if (currentStep === 2) {
      onSaveBtnClick();
    }
  };

  const onPrevBtnClick = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const onSaveBtnClick = async () => {
    if (!allowBtn) return;
    if (!date || !startTime || !endTime) return;

    const { startsAt, endsAt } = buildMeetingTimeRange(
      date,
      startTime,
      endTime
    );

    if (!endsAt.isAfter(startsAt)) {
      alert("종료 시간이 시작 시간보다 늦어야 합니다.");
      return;
    }

    try {
      setIsLoading(true);

      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData?.user) {
        throw userError ?? new Error("로그인이 필요합니다.");
      }
      const user = userData.user;

      const { error } = await supabase.from("meetings").insert({
        room_id: "ROOM-1",
        title: title.trim(),
        description: description.trim(),
        starts_at: startsAt.toDate().toISOString(),
        ends_at: endsAt.toDate().toISOString(),
        created_by: user.id,
      });

      if (error) {
        if (
          error.message?.includes("meetings_no_overlap") ||
          error.details?.includes("meetings_no_overlap")
        ) {
          alert("이미 해당 시간에 예약된 회의가 있습니다.");
        } else {
          console.error("회의 예약 중 에러:", error);
          alert("회의 예약 중 오류가 발생했습니다.");
        }
        return;
      }

      alert("회의 예약이 완료되었습니다.");
      closeModal();
    } catch (err) {
      console.log("addMeetingModal.jsx 의 onSaveBtnClick 에서 에러 :", err);
      alert("회의 예약 중 문제가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const pad = (n) => String(n).padStart(2, "0");
  const summary = (() => {
    const d = date;
    const s = startTime;
    const e = endTime;
    if (!d || !s || !e) return "";

    const dateText = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate()
    )}`;
    const sText = `${pad(s.hour())}:${pad(s.minute())}`;
    const eText = `${pad(e.hour())}:${pad(e.minute())}`;
    return `${dateText} · ${sText} ~ ${eText}`;
  })();

  return (
    <>
      {currentStep === 0 ? (
        <Wrapper>
          <SectionTitle>날짜 선택</SectionTitle>
          <div style={{ padding: "0 24px" }}>
            <Calendar
              minDate={new Date()}
              maxDate={new Date(2026, 11, 31)}
              onChange={setDate}
              value={date}
              formatDay={(locale, date) =>
                date.toLocaleString("en", { day: "numeric" })
              }
            />
          </div>
          <ButtonWrap>
            <NextButton
              onClick={onNextBtnClick}
              isallowed={allowBtn ? "true" : "false"}
            >
              다음
            </NextButton>
          </ButtonWrap>
        </Wrapper>
      ) : currentStep === 1 ? (
        <Wrapper>
          <SectionTitle>시간 선택</SectionTitle>
          <TimePickerRow>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer
                components={["MobileTimePicker", "MobileTimePicker"]}
              >
                <DemoItem label="시작 시간">
                  <MobileTimePicker
                    value={startTime}
                    onChange={(v) => v && setStartTime(v)}
                    slotProps={timePickerSlotProps} // ✅ 스타일 적용
                  />
                </DemoItem>
                <DemoItem label="종료 시간">
                  <MobileTimePicker
                    value={endTime}
                    onChange={(v) => v && setEndTime(v)}
                    slotProps={timePickerSlotProps} // ✅ 스타일 적용
                  />
                </DemoItem>
              </DemoContainer>
            </LocalizationProvider>
          </TimePickerRow>
          <SummaryText>{summary}</SummaryText>
          <ButtonWrap>
            <PrevButton onClick={onPrevBtnClick}>이전</PrevButton>
            <NextButton
              onClick={onNextBtnClick}
              isallowed={allowBtn ? "true" : "false"}
            >
              다음
            </NextButton>
          </ButtonWrap>
        </Wrapper>
      ) : currentStep === 2 ? (
        <Wrapper>
          <SectionTitle>회의 정보</SectionTitle>
          <div style={{ padding: "0 30px" }}>
            <TitleInput
              style={{ marginTop: 12 }}
              value={title}
              onChange={onTitleChange}
              placeholder="회의 제목"
            />
            <InputField
              style={{ marginTop: 24 }}
              screenwidth={380}
              onChange={onDescChange}
              value={description}
              placeholder="설명"
            />
            <SummaryText>{summary}</SummaryText>
          </div>
          <ButtonWrap>
            <PrevButton onClick={onPrevBtnClick}>이전</PrevButton>
            <NextButton
              onClick={onSaveBtnClick}
              isallowed={allowBtn ? "true" : "false"}
            >
              {isLoading ? <LoadingArea>저장중...</LoadingArea> : "예약"}
            </NextButton>
          </ButtonWrap>
        </Wrapper>
      ) : null}
    </>
  );
}
