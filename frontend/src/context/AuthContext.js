import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

const api = axios.create({
  baseURL: "http://localhost:8000", // Your Python backend
});

// Interceptor to automatically add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on app load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // 🔒 SECURITY: Token Theft Detection
      // Verify that the token belongs to the currently logged-in user
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        const tokenUserId = tokenPayload.user_id;
        const storedUserId = localStorage.getItem("user_id");
        
        // If user_id exists in localStorage, validate token ownership
        if (storedUserId && tokenUserId !== storedUserId) {
          console.error("🚨 SECURITY ALERT: TOKEN THEFT DETECTED!");
          console.error(`Token belongs to user: ${tokenUserId}`);
          console.error(`But logged in as: ${storedUserId}`);
          console.error("This token was likely copied from another user.");
          console.error("Forcing logout for security...");
          
          // Force logout and clear everything
          localStorage.clear();
          setUser(null);
          setLoading(false);
          window.location.href = "/login";
          return;
        }
      } catch (error) {
        console.error("Error parsing token:", error);
        localStorage.clear();
        setLoading(false);
        return;
      }
      
      // Optionally validate token by fetching profile
      api
        .get("/api/auth/profile")
        .then((res) => {
          setUser(res.data);
          // Store user_id for future validation
          localStorage.setItem("user_id", res.data._id);
        })
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user_id");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/api/auth/login", { email, password });
    const { token, user } = res.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user_id", user._id); // Store user_id for security validation
    setUser(user);
    return user;
  };

  const register = async (name, email, password) => {
    await api.post("/api/auth/register", { name, email, password });
    // Auto login after register
    return await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    setUser(null);
    // Force page reload to clear all state and redirect to login
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};