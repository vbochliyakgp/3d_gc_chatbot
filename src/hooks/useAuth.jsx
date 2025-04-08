import axios from "axios";
import { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    setIsAuthenticated(!!token);
  }, [token]);

  const login = async (employeeId, password) => {
    try {
      const response = await axios.post('http://localhost:8003/api/login', { employeeId, password });
      const data = response.data;
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
          employeeId: data.employeeId,
          userId: data.userId,
        }));
        
        setToken(data.token);
        setUser({
          employeeId: data.employeeId,
          userId: data.userId,
        });
        
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.error("Login error", err);
      return false;
    }
  };

  const logout = async () => {
    try {
      await axios.post('http://localhost:8003/api/logout');
    } catch (error) {
      console.error("Logout error:", error);
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};