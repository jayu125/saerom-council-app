import styled from "styled-components";
import Calendar from "../components/calendarComponent";

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
`;

export default function CalendarPage() {
  return (
    <Wrapper>
      <Calendar />
    </Wrapper>
  );
}
