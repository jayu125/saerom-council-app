import styled from "styled-components";

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  background-color: #1b1b1b;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const Text = styled.div`
  color: var(--Text-sub);
  font-size: 16px;
`;

export default function NoAccessPage() {
  return (
    <Wrapper>
      <Text>조금만 기다려주세요</Text>
      <Text>관리자가 계정을 검토중이에요...</Text>
    </Wrapper>
  );
}
