import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function CompanyGuardedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user || !user.isAuthenticated) return <Navigate to="/login" replace />;
  if (!user.company) {
    return (
      <Navigate
        to="/company-registration"
        replace
        state={{ message: "Please register your company first to continue." }}
      />
    );
  }

  return children;
}
