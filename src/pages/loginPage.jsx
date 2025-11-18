import styled from "styled-components";
import GoogleLoginButton from "../utils/googleLoginButton";

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default function LoginPage() {
  return (
    <Wrapper>
      <GoogleLoginButton />
    </Wrapper>
  );
}
