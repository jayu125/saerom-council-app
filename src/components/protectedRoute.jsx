import { Navigate } from "react-router-dom";
import { useAuth } from "../utils/useAuth";

export default function ProtectedRoute({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return null; // 초기 로딩 중
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
