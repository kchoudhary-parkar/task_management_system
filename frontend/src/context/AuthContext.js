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
      // Optionally validate token by fetching profile
      api
        .get("/api/auth/profile")
        .then((res) => {
          setUser(res.data);
        })
        .catch(() => {
          localStorage.removeItem("token");
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