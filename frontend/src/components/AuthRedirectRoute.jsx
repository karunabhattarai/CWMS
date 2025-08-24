import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const AuthRedirectRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If user is authenticated, redirect to dashboard
  if (user && user.isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // If not authenticated, show the children (landing page)
  return children;
};

export default AuthRedirectRoute;
