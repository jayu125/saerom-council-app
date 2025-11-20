import styled from "styled-components";
import { supabase } from "../supabaseClient";

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

const LogoutButton = styled.div`
  width: 100%;
  height: 54px;
  border-radius: 15px;
  background-color: var(--point-red);
  color: var(--Text-main);
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
  margin-top: 24px;

  &:active {
    transition: all 0.15s;
    transform: var(--active-transform);
    background-color: var(--background-lower);
  }
`;

export default function NoAccessPage() {
  const handleLogout = async () => {
    try {
      // Supabase 세션 제거
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("로그아웃 중 에러:", error);
        alert("로그아웃 중 오류가 발생했습니다.");
        return;
      }
      const navigate = useNavigate();
      // 로그인 페이지로 이동
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("handleLogout 에서 에러:", err);
      alert("로그아웃 처리 중 문제가 발생했습니다.");
    }
  };
  return (
    <Wrapper>
      <Text>조금만 기다려주세요</Text>
      <Text>관리자가 계정을 검토중이에요...</Text>
      <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
    </Wrapper>
  );
}
