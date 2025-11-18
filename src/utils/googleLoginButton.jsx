import styled from "styled-components";
import { supabase } from "../supabaseClient";

const Button = styled.button`
  width: 80%;
  height: 80px;
  border-radius: 20px;
`;

export default function GoogleLoginButton() {
  async function signIn() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin, // 반드시 URL 설정에 허용되어 있어야 함
        queryParams: {
          prompt: "select_account", // 계정 선택 강제(선택)
          // scope: 'openid email profile',     // 기본 스코프면 생략 가능
        },
      },
    });
    if (error) {
      console.error(error);
      alert(error.message);
    }
  }

  return <Button onClick={signIn}>Google로 로그인</Button>;
}

export function LogoutButton() {
  async function signOut() {
    await supabase.auth.signOut();
  }
  return <Button onClick={signOut}>로그아웃</Button>;
}
