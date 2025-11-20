import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import styled from "styled-components";

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
`;

export default function DepartmentPage() {
  return (
    <Wrapper>
      <DotLottieReact
        src="https://lottie.host/8b6e9b97-7e11-469a-9a4f-4c2a3757361f/HI9cMJMDTT.lottie"
        loop
        autoplay
      />
    </Wrapper>
  );
}
