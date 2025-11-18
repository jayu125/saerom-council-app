import styled from "styled-components";
import { LogoutButton } from "../utils/googleLoginButton";

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
`;

export default function MyPage() {
  return (
    <Wrapper>
      <LogoutButton />
    </Wrapper>
  );
}
