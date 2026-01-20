import React, { useContext, useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import { DashboardPage } from "./pages/Dashboard";
import { ProjectsPage } from "./pages/Projects";
import { TasksPage } from "./pages/Tasks";
import { MyTasksPage } from "./pages/MyTasks";
import SprintPage from "./pages/Sprints/SprintPage";
import UsersPage from "./pages/Users/UsersPage";
import { SuperAdminDashboard } from "./pages/SuperAdminDashboard";
import SystemDashboardPage from "./pages/SystemDashboard/SystemDashboardPage";
import AIChatbot from "./components/Chat/AIChatbot";
import PasswordInput from "./components/Input/PasswordInput"
import "./App.css";
import Loader from "./components/Loader/Loader";

function App() {
  const { user, loading, login, register, logout } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  // Global Theme State
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("app-theme") ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light")
      );
    }
    return "dark";
  });

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("app-theme", theme);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      if (!localStorage.getItem("app-theme")) {
        setTheme(e.matches ? "dark" : "light");
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  // Toggle theme function
  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Reset form when switching between login/register
  useEffect(() => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setErrors({});
    setSuccess("");
  }, [isLogin]);

  const validateForm = () => {
    const newErrors = {};

    // Name validation (only for registration)
    if (!isLogin) {
      if (!name.trim()) {
        newErrors.name = "Name is required";
      } else if (name.trim().length < 3) {
        newErrors.name = "Name must be at least 3 characters";
      }
    }

    // Email validation
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    // Password validation (basic check - detailed validation in PasswordInput)
    if (!password) {
      newErrors.password = "Password is required";
    }

    // Confirm password validation (only for registration)
    if (!isLogin) {
      if (!confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setError("");
    setErrors({});
    setSuccess("");

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      if (isLogin) {
        await login(email, password);
        setSuccess("Logged in successfully!");
      } else {
        await register(name, email, password, confirmPassword);
        setSuccess("Registered and logged in!");
      }
      
      // Clear form on success
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Auth error:", err);
      
      // Handle backend validation errors
      const errorData = err.response?.data;
      
      if (errorData?.error) {
        // Check if error is an object with errors array (password validation)
        if (typeof errorData.error === 'object' && errorData.error.errors) {
          setError(errorData.error.message || "Validation failed");
          // You could also display individual errors here
          console.log("Validation errors:", errorData.error.errors);
        } else {
          setError(errorData.error);
        }
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }
    }
  };

  const handleFieldChange = (field, value) => {
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    if (error) {
      setError("");
    }
    
    // Update field value
    switch(field) {
      case 'name':
        setName(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        break;
      default:
        break;
    }
  };

  // Show loading state while checking authentication
  if (loading) {
    return null;
  }

  return (
    <Router>
      <div className="App">
        {user ? (
          <>
            <nav className="navbar">
              <div className="nav-container">
                <div className="nav-brand">
                  <div className="nav-brand-title">
                    <a href="/">DOIT</a>
                  </div>
                </div>

                <div className="nav-actions">
                  {/* Theme Toggle Button */}
                  <button
                    onClick={toggleTheme}
                    className="theme-toggle-btn"
                    title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                    aria-label={`Switch to ${
                      theme === "dark" ? "light" : "dark"
                    } mode`}
                  >
                    {theme === "dark" ? "☀️" : "🌙"}
                  </button>

                  <div className="nav-user">
                    <div className="user-avatar">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-info">
                      <div className="user-name">{user.name}</div>
                      <div className="user-role">
                        {user.role === "super-admin"
                          ? "Super Admin"
                          : user.role.charAt(0).toUpperCase() +
                            user.role.slice(1)}
                      </div>
                    </div>
                    <button type="button" onClick={logout} className="btn-logout">
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </nav>

            <main style={{ paddingTop: "0px", minHeight: "calc(100vh - 80px)" }}>
              <Routes>
                <Route 
                  path="/" 
                  element={
                    user.role === "super-admin" 
                      ? <SuperAdminDashboard /> 
                      : <DashboardPage />
                  } 
                />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/projects/:projectId/tasks" element={<TasksPage />} />
                <Route
                  path="/projects/:projectId/sprints"
                  element={<SprintPage />}
                />
                <Route path="/my-tasks" element={<MyTasksPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/system-dashboard" element={<SystemDashboardPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <AIChatbot user={user} />
          </>
        ) : (
          <>
            <div className="bg-gradient" />
            <header className="App-header">
              <div className="brand">
                <h1 className="brand-title">DOIT</h1>
                <p className="brand-subtitle">Task management made simple</p>
              </div>

              <div className="glass-card">
                <div className="tab-toggle">
                  <button
                    type="button"
                    className={`tab-btn ${isLogin ? "active" : ""}`}
                    onClick={() => setIsLogin(true)}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    className={`tab-btn ${!isLogin ? "active" : ""}`}
                    onClick={() => setIsLogin(false)}
                  >
                    Register
                  </button>
                </div>

                <h2 className="section-title">
                  {isLogin ? "Welcome back" : "Create your account"}
                </h2>

                <form onSubmit={handleSubmit} className="auth-form" noValidate>
                  {!isLogin && (
                    <div className="field">
                      <label htmlFor="name">Full Name</label>
                      <input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                        className={errors.name ? 'error-input' : ''}
                        required
                      />
                      {errors.name && (
                        <span className="error-text">{errors.name}</span>
                      )}
                    </div>
                  )}

                  <div className="field">
                    <label htmlFor="email">Email</label>
                    <input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      className={errors.email ? 'error-input' : ''}
                      required
                    />
                    {errors.email && (
                      <span className="error-text">{errors.email}</span>
                    )}
                  </div>

                  <div className="field">
                    <label htmlFor="password">Password</label>
                    {isLogin ? (
                      <input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => handleFieldChange('password', e.target.value)}
                        className={errors.password ? 'error-input' : ''}
                        required
                      />
                    ) : (
                      <PasswordInput
                        id="password"
                        value={password}
                        onChange={(value) => handleFieldChange('password', value)}
                        placeholder="Create a strong password"
                        showStrength={true}
                        showRequirements={true}
                      />
                    )}
                    {errors.password && (
                      <span className="error-text">{errors.password}</span>
                    )}
                  </div>

                  {!isLogin && (
                    <div className="field">
                      <label htmlFor="confirmPassword">Confirm Password</label>
                      <input
                        id="confirmPassword"
                        type="password"
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                        className={errors.confirmPassword ? 'error-input' : ''}
                        required
                      />
                      {errors.confirmPassword && (
                        <span className="error-text">{errors.confirmPassword}</span>
                      )}
                      {confirmPassword && password !== confirmPassword && (
                        <span className="error-text">❌ Passwords do not match</span>
                      )}
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary full-width">
                    {isLogin ? "Login" : "Register"}
                  </button>
                </form>

                <p className="switch-text">
                  {isLogin
                    ? "Don't have an account?"
                    : "Already have an account?"}{" "}
                  <span
                    className="switch-link"
                    onClick={() => setIsLogin(!isLogin)}
                  >
                    {isLogin ? "Register here" : "Login here"}
                  </span>
                </p>

                {error && <p className="message error">{error}</p>}
                {success && <p className="message success">{success}</p>}
              </div>
            </header>
          </>
        )}
      </div>
    </Router>
  );
}

export default App;