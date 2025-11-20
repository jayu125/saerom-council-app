import styled from "styled-components";
import GoogleLoginButton from "../utils/googleLoginButton";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "../supabaseClient";

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #1b1b1b;
`;

export default function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        // 이미 로그인되어 있으므로 홈으로 이동
        navigate("/", { replace: true });
      }
    })();
  }, []);
  return (
    <Wrapper>
      <GoogleLoginButton />
    </Wrapper>
  );
}
