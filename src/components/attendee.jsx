import styled from "styled-components";
import { BaselinePeopleOutline } from "../icons/people";
import { BaselineKeyboardArrowRight } from "../icons/rightArrow";
import { useState } from "react";

const Wrapper = styled.div`
  width: 100%;
  height: 60px;
  padding: 10px 20px 10px 0px;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
`;

const Inner = styled.div`
  width: 100%;
  height: 60px;
  border-radius: 5px;
  border: 1px solid var(--background-lower);
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Left = styled.div`
  width: 60px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Mid = styled.div`
  font-size: 12px;
  color: var(--Text-sub);
`;

const Right = styled.div`
  width: 60px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalWrap = styled.div`
  z-index: 1001;
  width: 400px;
  height: 600px;
`;

export default function Attendees() {
  const [isAttendeeModalOpen, setIsAttendeeModalOpen] = useState(false);
  return (
    <>
      <Wrapper>
        <BaselinePeopleOutline
          width="36px"
          height="36px"
          color="var(--Text-sub)"
        />
        <Inner
          onClick={() => {
            setIsAttendeeModalOpen(true);
          }}
        >
          <Left></Left>
          <Mid>...</Mid>
          <Right>
            <BaselineKeyboardArrowRight
              width="24px"
              height="24px"
              color="var(--Text-sub)"
            />
          </Right>
        </Inner>
      </Wrapper>
      {isAttendeeModalOpen ? <ModalWrap></ModalWrap> : null}
    </>
  );
}
