import React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  height: ${({ $device }) => ($device === "phone" ? "12px" : "16px")};
  width: 100%;
  border-radius: 4px;
  background: ${({ $bgcolor }) => $bgcolor};
  color: var(--Text-main);
  display: flex;
  justify-content: left;
  align-content: center;
  font-size: ${({ $device }) => ($device === "phone" ? "9px" : "12px")};
  font-weight: 600;
  box-sizing: border-box;
  padding: 0px 2px 0px 4px;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
`;

function DayEvent({ event, device }) {
  return (
    <Wrapper $device={device} $bgcolor={event.color ?? "var(--Text-main)"}>
      {event.title}
    </Wrapper>
  );
}

export default React.memo(DayEvent);
