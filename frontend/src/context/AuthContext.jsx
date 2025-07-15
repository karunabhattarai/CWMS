import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Utility to check if token is expired
  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (err) {
      return true;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token && !isTokenExpired(token)) {
      const decodedUser = jwtDecode(token);
      setUser({
        ...decodedUser,
        isAuthenticated: true,
        token,
      });
    } else {
      logout();
    }

    setLoading(false);
  }, []);

  const login = (token) => {
    localStorage.setItem("token", token);
    const decodedUser = jwtDecode(token);
    setUser({
      ...decodedUser,
      isAuthenticated: true,
      token,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
