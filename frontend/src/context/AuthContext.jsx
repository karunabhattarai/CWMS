import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "./AuthContextDef";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if token is expired
  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    if (!token) return false;
    if (isTokenExpired(token)) {
      logout();
      return false;
    }
    return true;
  };

  // Get user role and permissions
  const getUserRole = () => {
    return user?.role || null;
  };

  const getUserPermissions = () => {
    return user?.permissions || [];
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    const permissions = getUserPermissions();
    return permissions.includes(permission);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      if (isTokenExpired(token)) {
        localStorage.removeItem("token");
        setUser(null);
      } else {
        try {
          const decoded = jwtDecode(token);
          setUser({
            ...decoded,
            isAuthenticated: true,
            token,
          });
        } catch {
          localStorage.removeItem("token");
          setUser(null);
        }
      }
    }
    setLoading(false);
  }, []);

  // Login only expects a token string
  const login = (token) => {
    if (isTokenExpired(token)) {
      throw new Error("Token is expired");
    }

    localStorage.setItem("token", token);
    const decoded = jwtDecode(token);
    setUser({
      ...decoded,
      isAuthenticated: true,
      token,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  // Update user profile without affecting authentication status
  const updateUserProfile = (updates) => {
    if (user) {
      setUser((prev) => ({
        ...prev,
        ...updates,
      }));
    }
  };

  const authContextValue = {
    user,
    loading,
    isAuthenticated: isAuthenticated(),
    login,
    logout,
    setUser,
    updateUserProfile,
    getUserRole,
    getUserPermissions,
    hasPermission,
    isTokenExpired,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}
