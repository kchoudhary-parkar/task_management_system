import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

const api = axios.create({
  baseURL: "http://localhost:8000", // Your Python backend
});

// Interceptor to automatically add token and tab session key to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const tabSessionKey = sessionStorage.getItem("tab_session_key");  // 🔐 Tab-specific key
  
  console.log("[API] Request to:", config.url);
  console.log("[API] Token exists:", !!token);
  console.log("[API] Tab key exists:", !!tabSessionKey);
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  if (tabSessionKey) {
    config.headers["X-Tab-Session-Key"] = tabSessionKey;  // 🔐 Send tab key
    console.log("[API] Sending tab key:", tabSessionKey.substring(0, 8) + "...");
  } else {
    console.warn("[API] ⚠️ Tab session key missing! This request will likely fail.");
  }
  
  return config;
});

// Interceptor to handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem("token");
      localStorage.removeItem("user_id");
      // Don't redirect here, let the component handle it
    }
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on app load
  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("[AUTH] Checking authentication on app load...");
    console.log("[AUTH] Token exists:", !!token);
    
    if (token) {
      // 🔒 SECURITY: Token Theft Detection
      // Verify that the token belongs to the currently logged-in user
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        const tokenUserId = tokenPayload.user_id;
        const storedUserId = localStorage.getItem("user_id");
        
        console.log("[AUTH] Token user_id:", tokenUserId);
        console.log("[AUTH] Stored user_id:", storedUserId);
        
        // ⚠️ IMPORTANT: Don't validate ownership here - let backend handle it
        // This check only catches obvious tampering (mismatched IDs)
        // Backend will validate the session properly
        if (storedUserId && tokenUserId !== storedUserId) {
          console.error("🚨 SECURITY ALERT: TOKEN MISMATCH!");
          console.error(`Token belongs to user: ${tokenUserId}`);
          console.error(`But localStorage has: ${storedUserId}`);
          console.error("Possible token theft or tampering detected.");
          
          // Force logout and clear everything
          localStorage.clear();
          setUser(null);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error("[AUTH] Error parsing token:", error);
        localStorage.clear();
        setUser(null);
        setLoading(false);
        return;
      }
      
      // Check if tab session key exists
      const tabSessionKey = sessionStorage.getItem("tab_session_key");
      console.log("[AUTH] Tab session key exists:", !!tabSessionKey);
      
      if (!tabSessionKey) {
        console.warn("[AUTH] No tab session key found - creating new tab session");
        // Create a new tab session by "refreshing" the token
        // This will create a new session for this tab
        api
          .post("/api/auth/refresh-session")
          .then((res) => {
            console.log("[AUTH] New tab session created:", res.data);
            const newTabKey = res.data.tab_session_key;
            if (newTabKey) {
              sessionStorage.setItem("tab_session_key", newTabKey);
              console.log("[AUTH] New tab session key stored");
            }
            // Now fetch profile with new tab session
            return api.get("/api/auth/profile");
          })
          .then((res) => {
            console.log("[AUTH] Profile fetch successful:", res.data);
            const userData = res.data;
            if (userData.id && !userData._id) {
              userData._id = userData.id;
            }
            setUser(userData);
            localStorage.setItem("user_id", userData.id || userData._id);
            console.log("[AUTH] User authenticated successfully");
            setLoading(false);
          })
          .catch((error) => {
            console.error("[AUTH] Session creation/validation failed:", error);
            localStorage.removeItem("token");
            localStorage.removeItem("user_id");
            setUser(null);
            setLoading(false);
          });
        return;
      }
      
      // Validate token by fetching profile
      // ⚠️ Backend will perform the REAL security validation:
      // - Check if session exists
      // - Verify session belongs to token's user
      // - Validate tab session key (prevents cross-tab theft)
      // - Validate IP/User-Agent if strict mode enabled
      console.log("[AUTH] Fetching user profile with tab key:", tabSessionKey ? tabSessionKey.substring(0, 8) + "..." : "none");
      api
        .get("/api/auth/profile")
        .then((res) => {
          console.log("[AUTH] Profile fetch successful:", res.data);
          const userData = res.data;
          // Normalize the user data - backend returns 'id', but we use '_id' internally
          if (userData.id && !userData._id) {
            userData._id = userData.id;
          }
          setUser(userData);
          // Store user_id for future validation (backend returns 'id')
          localStorage.setItem("user_id", userData.id || userData._id);
          console.log("[AUTH] User authenticated successfully");
          setLoading(false);
        })
        .catch((error) => {
          console.error("[AUTH] Token validation failed:", error.response?.status, error.response?.data);
          console.error("[AUTH] Full error:", error);
          // Clear everything on auth failure
          localStorage.removeItem("token");
          localStorage.removeItem("user_id");
          setUser(null);
          setLoading(false);
        });
    } else {
      console.log("[AUTH] No token found, user not logged in");
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/api/auth/login", { email, password });
    console.log("[AUTH] Login response:", res.data);
    const { token, user, tab_session_key } = res.data;

    console.log("[AUTH] Token received:", !!token);
    console.log("[AUTH] User received:", user);
    console.log("[AUTH] Tab session key received:", tab_session_key);

    localStorage.setItem("token", token);
    // Backend returns 'id', not '_id'
    localStorage.setItem("user_id", user.id || user._id);
    
    // 🔐 Store tab session key in sessionStorage (unique per tab)
    if (tab_session_key) {
      sessionStorage.setItem("tab_session_key", tab_session_key);
      console.log("[AUTH] ✅ Tab session key stored successfully:", tab_session_key.substring(0, 8) + "...");
    } else {
      console.error("[AUTH] ❌ Tab session key NOT received from backend!");
    }
    
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
    sessionStorage.removeItem("tab_session_key");  // 🔐 Clear tab key
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