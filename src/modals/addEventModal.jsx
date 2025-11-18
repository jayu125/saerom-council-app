import styled from "styled-components";
import Selection from "../components/selectBox";
import { useEffect, useRef, useState } from "react";
import { Location } from "../icons/locationIocn";
import { Document } from "../icons/document";
import dayjs from "dayjs";
import { LocalizationProvider, MobileTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DemoContainer, DemoItem } from "@mui/x-date-pickers/internals/demo";
import { useModal } from "../components/modal";
import { OrbitProgress } from "react-loading-indicators";
import { supabase } from "../supabaseClient";
import { ymdToISO } from "../utils/dateRange";
import { CirclePicker } from "react-color";

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  /* padding: 10px 0px; */
  overflow-y: scroll;
  scroll-behavior: smooth;
  overscroll-behavior: contain;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const TitleInput = styled.input`
  all: unset;
  width: 100%;
  height: 46px;
  /* background-color: var(--background-btn); */
  border-bottom: 1px solid var(--background-btn);
  /* border-radius: 10px; */
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  padding: 4px 20px;
  text-align: center;
  color: var(--Text-main);
  font-weight: 600;
  font-size: 26px;
  transition: all 0.5s;
  position: relative;

  &::placeholder {
    color: var(--Text-sub);
    font-weight: 500;
    font-size: 16px;
    position: absolute;
    transform: translate(-50%, -50%);
    top: 50%;
    left: 50%;
  }
  &:not(:placeholder-shown) {
    /* background-color: var(--Text-lower); */
    border-bottom: 1px solid var(--background-elevate);
  }
  &:focus {
    /* background-color: var(--background-btn); */
    border-bottom: 1px solid var(--Text-sub);
    font-weight: 700;
    font-size: 18px;
  }
`;

export const InputField = styled.input`
  all: unset;
  width: 100%;
  height: 40px;
  border-bottom: 1px solid var(--background-btn);
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  padding: ${({ screenwidth }) => `4px 20px 4px ${screenwidth / 2 - 62}px`};
  /* text-align: center; */
  color: var(--Text-main);
  font-weight: 600;
  font-size: 16px;
  transition: all 0.5s;
  &:focus {
    padding: 4px 20px;
    border-bottom: 1px solid var(--Text-sub);
  }
  &:not(:placeholder-shown) {
    border-bottom: 1px solid var(--Text-sub);
    padding: 4px 20px;
  }
`;

const InputWrap = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 0px;
  position: relative;
`;

const SaveButton = styled.div`
  width: 100%;
  height: 54px;
  background-color: ${({ isallowed }) =>
    isallowed === "true" ? "var(--background)" : "var(--background-btn)"};
  color: ${({ isallowed }) =>
    isallowed === "true" ? "var(--Text-main)" : "var(--Text-sub)"};
  display: flex;
  justify-content: center;
  align-items: center;
  /* border-radius: 0px 18px 18px 0px; */
  border-radius: 15px;
  font-weight: 500;
  transition: all 0.2s;

  &:active {
    transform: ${({ isallowed }) =>
      isallowed === "true" ? "var(--active-transform)" : null};
    background-color: var(--background-lower);
  }
`;

// const CancelButton = styled.div`
//   width: 50%;
//   height: 60px;
//   background-color: var(--background-elevate);
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   border-radius: 18px 0px 0px 18px;
//   color: var(--Text-main);
//   font-weight: 700;
//   font-size: 18px;

//   &:active {
//     transition: all 0.2s;
//     transform: var(--active-transform);
//     background-color: #2b2b2b;
//   }
// `;

const BtnArea = styled.div`
  width: calc(100% - 60px);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  position: absolute;
  bottom: 150px;
  gap: 2px;
  transform: translate(-50%, 0px);
  bottom: 50px;
  left: 50%;
`;

const SelectionArea = styled.div`
  margin-top: 36px;
  display: flex;
  gap: 16px;
`;

const TimePickerArea = styled.div`
  margin-top: 24px;
  display: flex;
  justify-content: center;
`;

const LoadingArea = styled.div`
  width: 64px;
  height: 64px;
  display: flex;
  justify-content: center;
  align-items: center;
  transform: scale(0.5);
`;

const EmptyArea = styled.div`
  width: 100%;
  height: 200px;
  /* background-color: cyan; */
`;

const ColorSelect = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  &:active {
    transition: all 0.2s var(--active-transform);
    background-color: var(--background-elevate);
  }
  background-color: ${({ $color }) => $color};
  position: absolute;
  right: 0px;
  top: 2px;
`;

const PaletteModal = styled.div`
  position: absolute;
  background-color: var(--background-lower);
  z-index: 1001;
  padding: 12px;
  border-radius: 10px;
  top: 60px;
  right: 36px;
`;

export default function AddEventModalChild() {
  const placeArr = ["학생회실", "강당", "운동장", "장소1", "장소2"];
  const [place, setPlace] = useState(null);
  const [allowSave, setAllowSave] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [time, setTime] = useState(dayjs().hour(9).minute(0));
  const [color, setColor] = useState("#F87171");
  const [colorModalOpen, setColorModalOpen] = useState(false);
  // const modalContext = useModal();
  const { openModal, closeModal, modalContent } = useModal();
  const [isLoading, setIsLoading] = useState(false);
  const [modalWidth, setModalWidth] = useState(0);

  const colorModalRef = useRef(null);
  const selectionAreaRef = useRef(null);

  const onColorSelected = (color) => {
    setColor(color.hex);
    setColorModalOpen(false);
  };

  useEffect(() => {
    if (selectionAreaRef.current) {
      setModalWidth(selectionAreaRef.current.getBoundingClientRect().width);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        colorModalRef.current &&
        !colorModalRef.current.contains(event.target)
      ) {
        setColorModalOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setColorModalOpen]);

  const onchange = (e) => {
    setTitle(e.target.value);
  };

  const onDescChange = (e) => {
    setDescription(e.target.value);
  };

  const onSaveClick = async () => {
    if (!allowSave) return;
    setIsLoading(true);
    setAllowSave(false);
    try {
      // const date = modalContext[0].date; // {year, month, dayId}
      const date = modalContent.date; // {year, month, dayId}
      if (!date) throw new Error("날짜 정보가 없습니다.");

      // 시간 결합 (Asia/Seoul 로컬 → ISO)
      const startsISO = ymdToISO(
        date.year,
        date.month,
        date.dayId,
        time.hour(),
        time.minute()
      );

      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) throw new Error("로그인이 필요합니다.");

      const { error } = await supabase.from("events").insert({
        user_id: user.user.id,
        title,
        description: description,
        location: place,
        starts_at: startsISO,
        ends_at: null,
        all_day: false,
        color: color,
      });
      if (error) throw error;
    } catch (err) {
      console.log("onsaveclick 에서 에러 발생 :", err);
    } finally {
      setIsLoading(false);
      setAllowSave(true);
      // modalContext[1](false);
      closeModal();
      //캘린더 페이지 새로고침 필요 (업데이트)
    }
  };

  useEffect(() => {
    if (title !== "") {
      setAllowSave(true);
    } else {
      setAllowSave(false);
    }
  }, [title]);

  return (
    <Wrapper>
      {colorModalOpen ? (
        <PaletteModal ref={colorModalRef}>
          <CirclePicker
            circleSize={28}
            colors={[
              "#F87171", // 1. Red — 긴급, 마감일
              "#FBBF24", // 2. Yellow — 중요, 알림
              "#34D399", // 3. Green — 완료, 휴가
              "#60A5FA", // 4. Blue — 회의, 업무
              "#A78BFA", // 5. Purple — 개인 일정
              "#F472B6", // 6. Pink — 기념일, 생일
              "#4ADE80", // 7. Lime — 운동, 건강
              "#38BDF8", // 8. Sky — 외근, 출장
              "#FB923C", // 9. Orange — 진행 중
              "#C084FC", // 10. Violet — 스터디, 협업
              "#2DD4BF", // 11. Teal — 프로젝트, 기술
              "#94A3B8", // 12. Gray — 기타, 미분류
            ]}
            onChangeComplete={onColorSelected}
          />
        </PaletteModal>
      ) : null}
      <InputWrap>
        <TitleInput
          value={title}
          onChange={onchange}
          placeholder="일정 제목을 입력해주세요"
        />
        <ColorSelect
          $color={color}
          onClick={() => {
            setColorModalOpen(true);
          }}
        ></ColorSelect>
      </InputWrap>
      <TimePickerArea>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DemoContainer components={["TimePicker", "MobileTimePicker"]}>
            <DemoItem>
              <MobileTimePicker
                value={time}
                onChange={(v) => v && setTime(v)}
                slotProps={{
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
                  },
                  // mobilePaper: {
                  //   sx: {
                  //     zIndex: 9999, // ✅ 원하는 z-index 값
                  //     backgroundColor: "var(--background-elevate)",
                  //   },
                  // },

                  mobilePaper: {
                    sx: {
                      // 🔹 모달 전체 배경
                      backgroundColor: "var(--background-elevate)",
                      color: "var(--Text-main)",

                      // 1️⃣ 상단의 큰 시간 숫자
                      "& .MuiPickersToolbar-content span": {
                        color: "var(--Text-sub)",
                      },

                      "& .MuiPickersToolbar-content span[data-selected]": {
                        color: "var(--Text-main)",
                      },

                      // 2️⃣ 시계의 텍스트 (1~12 숫자)
                      "& .MuiClockNumber-root": {
                        color: "var(--Text-main)",
                        fontWeight: 200,
                        fontFamily: "pretendard variable",
                      },

                      // 3️⃣ 시계의 침 (line) 및 침 끝의 원
                      "& .MuiClock-pin, & .MuiClockPointer-root": {
                        backgroundColor: "var(--Text-main)",
                      },

                      "& .MuiClockPointer-thumb": {
                        borderColor: "var(--Text-main)",
                        background: "var(--Text-main)",
                      },

                      // 4️⃣ 침 끝 원 위의 시각 (선택된 시각)
                      "& .MuiClockNumber-root.Mui-selected": {
                        color: "var(--background-elevate)",
                      },

                      "& .MuiPickersToolbar-root > span": {
                        color: "var(--Text-sub)",
                      },

                      // 5️⃣ 시계 배경
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
                }}
                defaultValue={dayjs("2022-04-17T15:30")}
              />
            </DemoItem>
          </DemoContainer>
        </LocalizationProvider>
      </TimePickerArea>
      <SelectionArea>
        <Location width="36px" height="36px" color="var(--Text-sub)" />
        <Selection arr={placeArr} state={place} setState={setPlace} />
      </SelectionArea>
      <SelectionArea ref={selectionAreaRef}>
        <Document width="40px" height="40px" color="var(--Text-sub)" />
        <InputField
          screenwidth={modalWidth}
          onChange={onDescChange}
          value={description}
          placeholder="설명"
        />
      </SelectionArea>
      <EmptyArea></EmptyArea>

      <BtnArea>
        {/* <CancelButton>취소</CancelButton> */}
        <SaveButton
          onClick={onSaveClick}
          isallowed={allowSave ? "true" : "false"}
        >
          {isLoading ? (
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
            "저장"
          )}
        </SaveButton>
      </BtnArea>
    </Wrapper>
  );
}
