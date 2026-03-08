import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
    const interval = setInterval(checkAuth, 60000);
    return () => clearInterval(interval);
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    const tokenExpires = localStorage.getItem("tokenExpires");
    
    if (!token || !tokenExpires || Date.now() > parseInt(tokenExpires)) {
      if (location.pathname !== "/login") {
        logout();
      }
      return false;
    }
    
    setIsAuthenticated(true);
    return true;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpires");
    localStorage.removeItem("userEmail");
    setIsAuthenticated(false);
    if (location.pathname !== "/login") {
      navigate("/login", { replace: true });
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
