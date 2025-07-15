import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({
          ...decoded,
          isAuthenticated: true,
          token,
        });
      } catch (e) {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  // Login only expects a token string
  const login = (token) => {
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

  // setUser can be used for direct profile updates
  return (
    <AuthContext.Provider value={{ user, login, logout, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
