// calendarDay.jsx
import styled from "styled-components";
import { useModal } from "./modal";
import ViewEventModalChild, {
  EventDetailModalChild,
} from "../modals/viewEventModal";
import AddEventModalChild from "../modals/addEventModal";
import useLongPress from "../utils/useLongPress";
import DayEvent from "./dayEvent";
import { down, up } from "../styles/media";
import { useState } from "react";

const Wrapper = styled.div`
  height: 100%;
  /* display: flex;
  flex-direction: column;
  justify-content: left;
  align-items: center; */
  padding: 10px 0 0 0;
  box-sizing: border-box;
  position: relative;
  user-select: none;
  touch-action: manipulation;
  -webkit-touch-callout: none;

  /* 길게 눌러 링크 미리보기/공유 막기 */
  -webkit-user-select: none;

  /* 클릭 하이라이트 (회색 반짝임) 제거 */
  -webkit-tap-highlight-color: transparent;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background-color: var(--background-hover);
    }
  }

  &:active {
    transition: all 0.15s;
    transform: var(--active-transform);
    background-color: var(--background-elevate);
  }

  ${up("lg")`
    border-left: 2px solid var(--background-elevate);
  `}
`;

const Text = styled.p`
  font-size: 12px;
  font-weight: 500;
  z-index: 3;
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;

  position: absolute;

  &[class~="is-today"] {
    background-color: red;
    color: white;
  }

  &[class~="labeled"] {
    width: 40px;
  }

  ${down("lg")`
    transform: translate(-50%, -50%);
    left: 50%;
    top: 20px;
  `}

  ${up("lg")`
    right: 8px;
    top: 4px;
    font-size: 15px;
    font-weight: 400;
    &:not([class*="labeled"])::after {
      content: "일"
    }
    &[class*="is-today"] {
      margin-top: 5px;
      padding: 0px 4px;
      width: 30px;
      height: 20px;
      border-radius: 5px;
    }
  `}
`;

export default function Day({ dayN, className, events = [], device, ...rest }) {
  // const modalContext = useModal();
  const { openModal, closeModal } = useModal();

  const viewEventModal = {
    title: dayN ? `${dayN.year}년 ${dayN.month}월 ${dayN.dayId}일` : null,
    child: ViewEventModalChild,
    childProps: { date: dayN, events: events },
    expendChild: EventDetailModalChild,
  };

  const addEventModal = {
    title: "일정 추가",
    date: dayN,
    child: AddEventModalChild,
    childProps: {},
  };

  const longPress = useLongPress(() => {
    // modalContext[1]({
    //   isopen: true,
    //   ...addEventModal,
    // });
    openModal(addEventModal, {
      width: device == "phone" ? "350px" : "400px",
      height: 650,
    });
  }, 250);

  if (!dayN) return <Wrapper className={className} {...rest} />;
  if ("label" in dayN)
    return (
      <Wrapper className={className} {...rest}>
        <Text className="labeled">{dayN.label}</Text>
      </Wrapper>
    );

  return (
    <Wrapper
      onClick={() => {
        console.log("click to open");
        // modalContext[1]({ isopen: true, ...viewEventModal });
        openModal(viewEventModal, {
          width: device == "phone" ? "350px" : "400px",
          height: 500,
        });
      }}
      onContextMenu={(e) => {
        e.preventDefault();
      }}
      className={className}
      {...longPress}
      {...rest}
    >
      <Text className={className}>{dayN.dayId}</Text>
      {/* 간단한 점/배지 */}
      <div
        style={{
          position: "absolute",
          top: 40,
          width: "100%",
          display: "flex",
          gap: device == "phone" ? 3 : 5,
          flexWrap: "wrap",
          justifyContent: "center",
          padding: device == "phone" ? "0px 4px" : "0px 6px",
          boxSizing: "border-box",
        }}
      >
        {events.slice(0, device == "phone" ? 4 : 6).map((e) => (
          <DayEvent device={device} event={e} key={e.id} />
        ))}
        {events.length > (device == "phone" ? 4 : 6) && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--Text-sub)",
              marginTop: device == "phone" ? 2 : 0,
            }}
          >
            +{events.length - (device == "phone" ? 4 : 6)}
          </span>
        )}
      </div>
    </Wrapper>
  );
}
