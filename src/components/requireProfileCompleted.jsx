// routes/RequireProfileCompleted.jsx
import { Navigate } from "react-router-dom";
import useProfile from "../utils/useProfile";

export default function RequireProfileCompleted({ children }) {
  const { profile, loading } = useProfile();

  if (loading) {
    // 로딩 상태일 때는 스피너나 빈 화면
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--Text-sub)",
          fontSize: 14,
        }}
      >
        프로필을 확인하는 중...
      </div>
    );
  }

  // 프로필이 없거나, 부서/직책이 없는 유저 → 접근 차단
  const isProfileReady =
    profile &&
    profile.department &&
    profile.role &&
    profile.department.trim() !== "" &&
    profile.role.trim() !== "";

  if (!isProfileReady) {
    // 여기로 보내고, 안내 페이지를 따로 만들면 좋음
    return <Navigate to="/no-access" replace />;
  }

  // 정상 유저는 children 렌더
  return children;
}
