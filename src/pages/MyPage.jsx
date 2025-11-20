// src/pages/MyPage.jsx
import styled from "styled-components";
import useProfile from "../utils/useProfile";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 24px 20px 80px 20px;
  box-sizing: border-box;
`;

const Section = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.div`
  font-size: 12px;
  color: var(--Text-sub);
  margin-bottom: 6px;
`;

const Value = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: var(--Text-main);
`;

const BadgeRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

const Badge = styled.span`
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  color: var(--Text-main);
  background-color: var(--background-lower);
`;

const SubText = styled.div`
  font-size: 12px;
  color: var(--Text-sub);
  margin-top: 4px;
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

const DangerText = styled.div`
  font-size: 12px;
  color: var(--Text-sub);
  margin-top: 8px;
`;

export default function MyPage() {
  const { profile, loading, error } = useProfile();

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Supabase 세션 제거
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("로그아웃 중 에러:", error);
        alert("로그아웃 중 오류가 발생했습니다.");
        return;
      }

      // 로그인 페이지로 이동
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("handleLogout 에서 에러:", err);
      alert("로그아웃 처리 중 문제가 발생했습니다.");
    }
  };

  const roleLabelMap = {
    HEAD: "부장",
    VICE: "차장",
    MEMBER: "부원",
    EXEC: "회장단",
  };

  if (loading) {
    return (
      <Wrapper>
        <Value>프로필 불러오는 중...</Value>
      </Wrapper>
    );
  }

  if (error) {
    return (
      <Wrapper>
        <Value>프로필을 불러오는 중 문제가 생겼습니다.</Value>
        <SubText>{error.message}</SubText>
      </Wrapper>
    );
  }

  if (!profile) {
    return (
      <Wrapper>
        <Value>프로필이 아직 등록되지 않았습니다.</Value>
        <SubText>관리자에게 부서/직책 등록을 요청하세요.</SubText>
      </Wrapper>
    );
  }

  const dept = profile.department || "미지정";
  const roleLabel = profile.role
    ? roleLabelMap[profile.role] ?? profile.role
    : "미지정";

  return (
    <Wrapper>
      <Section>
        <Label>이름 / 닉네임</Label>
        <Value>{profile.display_name ?? "(이름 미지정)"}</Value>
        {profile.email && <SubText>{profile.email}</SubText>}
      </Section>

      <Section>
        <Label>부서 / 직책</Label>
        <BadgeRow>
          <Badge>{dept}</Badge>
          <Badge>{roleLabel}</Badge>
        </BadgeRow>
        <SubText>부서/직책 변경은 현재 관리자에게 문의해야 합니다.</SubText>
      </Section>
      <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
      <DangerText>이 기기에서만 로그아웃됩니다.</DangerText>

      {/* 앞으로 추가할 기능들 (나의 회의, 나의 일정, 알림 설정 등) */}
      {/* <Section>...</Section> */}
    </Wrapper>
  );
}
