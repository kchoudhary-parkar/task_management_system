// import React, { useContext, useState, useEffect } from "react";
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Navigate,
// } from "react-router-dom";
// import { AuthContext } from "./context/AuthContext";
// import { SignIn, SignUp, useAuth } from "@clerk/clerk-react";
// import { DashboardPage } from "./pages/Dashboard";
// import { ProjectsPage } from "./pages/Projects";
// import { TasksPage } from "./pages/Tasks";
// import { MyTasksPage } from "./pages/MyTasks";
// import SprintPage from "./pages/Sprints/SprintPage";
// import UsersPage from "./pages/Users/UsersPage";
// import { SuperAdminDashboard } from "./pages/SuperAdminDashboard";
// import SystemDashboardPage from "./pages/SystemDashboard/SystemDashboardPage";
// import AIChatbot from "./components/Chat/AIChatbot";
// import PasswordInput from "./components/Input/PasswordInput";
// import "./App.css";

// function App() {
//   const { user, loading, login, register, logout } = useContext(AuthContext);
//   const { isSignedIn } = useAuth();
//   const [authMode, setAuthMode] = useState("choice"); // 'choice', 'clerk', 'traditional', 'register'
//   const [isLogin, setIsLogin] = useState(true);
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [error, setError] = useState("");
//   const [errors, setErrors] = useState({});
//   const [success, setSuccess] = useState("");

//   // Global Theme State
//   const [theme, setTheme] = useState(() => {
//     if (typeof window !== "undefined") {
//       return (
//         localStorage.getItem("app-theme") ||
//         (window.matchMedia("(prefers-color-scheme: dark)").matches
//           ? "dark"
//           : "light")
//       );
//     }
//     return "dark";
//   });

//   useEffect(() => {
//     document.documentElement.setAttribute("data-theme", theme);
//     localStorage.setItem("app-theme", theme);

//     const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
//     const handleChange = (e) => {
//       if (!localStorage.getItem("app-theme")) {
//         setTheme(e.matches ? "dark" : "light");
//       }
//     };
//     mediaQuery.addEventListener("change", handleChange);
//     return () => mediaQuery.removeEventListener("change", handleChange);
//   }, [theme]);

//   const toggleTheme = () => {
//     setTheme((prev) => (prev === "dark" ? "light" : "dark"));
//   };

//   useEffect(() => {
//     setName("");
//     setEmail("");
//     setPassword("");
//     setConfirmPassword("");
//     setError("");
//     setErrors({});
//     setSuccess("");
//   }, [isLogin, authMode]);

//   const validateForm = () => {
//     const newErrors = {};

//     if (!isLogin) {
//       if (!name.trim()) {
//         newErrors.name = "Name is required";
//       } else if (name.trim().length < 3) {
//         newErrors.name = "Name must be at least 3 characters";
//       }
//     }

//     if (!email.trim()) {
//       newErrors.email = "Email is required";
//     } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
//       newErrors.email = "Invalid email format";
//     }

//     if (!password) {
//       newErrors.password = "Password is required";
//     }

//     if (!isLogin) {
//       if (!confirmPassword) {
//         newErrors.confirmPassword = "Please confirm your password";
//       } else if (password !== confirmPassword) {
//         newErrors.confirmPassword = "Passwords do not match";
//       }
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setErrors({});
//     setSuccess("");

//     if (!validateForm()) {
//       return;
//     }

//     try {
//       if (isLogin) {
//         await login(email, password);
//         setSuccess("Logged in successfully!");
//       } else {
//         await register(name, email, password, confirmPassword);
//         setSuccess("Registered and logged in!");
//       }

//       setName("");
//       setEmail("");
//       setPassword("");
//       setConfirmPassword("");
//     } catch (err) {
//       console.error("Auth error:", err);

//       const errorData = err.response?.data;

//       if (errorData?.error) {
//         if (typeof errorData.error === "object" && errorData.error.errors) {
//           setError(errorData.error.message || "Validation failed");
//         } else {
//           setError(errorData.error);
//         }
//       } else {
//         setError(err.message || "Something went wrong. Please try again.");
//       }
//     }
//   };

//   const handleFieldChange = (field, value) => {
//     if (errors[field]) {
//       setErrors((prev) => ({ ...prev, [field]: undefined }));
//     }
//     if (error) {
//       setError("");
//     }

//     switch (field) {
//       case "name":
//         setName(value);
//         break;
//       case "email":
//         setEmail(value);
//         break;
//       case "password":
//         setPassword(value);
//         break;
//       case "confirmPassword":
//         setConfirmPassword(value);
//         break;
//       default:
//         break;
//     }
//   };

//   if (loading) {
//     return null;
//   }

//   return (
//     <Router>
//       <div className="App">
//         {user ? (
//           <>
//             <nav className="navbar">
//               <div className="nav-container">
//                 <div className="nav-brand">
//                   <div className="nav-brand-title">
//                     <a href="/">DOIT</a>
//                   </div>
//                 </div>

//                 <div className="nav-actions">
//                   <button
//                     onClick={toggleTheme}
//                     className="theme-toggle-btn"
//                     title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
//                   >
//                     {theme === "dark" ? "☀️" : "🌙"}
//                   </button>

//                   <div className="nav-user">
//                     <div className="user-avatar">
//                       {user.name.charAt(0).toUpperCase()}
//                     </div>
//                     <div className="user-info">
//                       <div className="user-name">{user.name}</div>
//                       <div className="user-role">
//                         {user.role === "super-admin"
//                           ? "Super Admin"
//                           : user.role.charAt(0).toUpperCase() +
//                             user.role.slice(1)}
//                       </div>
//                     </div>
//                     <button type="button" onClick={logout} className="btn-logout">
//                       Logout
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </nav>

//             <main style={{ paddingTop: "0px", minHeight: "calc(100vh - 80px)" }}>
//               <Routes>
//                 <Route
//                   path="/"
//                   element={
//                     user.role === "super-admin" ? (
//                       <SuperAdminDashboard />
//                     ) : (
//                       <DashboardPage />
//                     )
//                   }
//                 />
//                 <Route path="/dashboard" element={<DashboardPage />} />
//                 <Route path="/projects" element={<ProjectsPage />} />
//                 <Route path="/projects/:projectId/tasks" element={<TasksPage />} />
//                 <Route
//                   path="/projects/:projectId/sprints"
//                   element={<SprintPage />}
//                 />
//                 <Route path="/my-tasks" element={<MyTasksPage />} />
//                 <Route path="/users" element={<UsersPage />} />
//                 <Route path="/system-dashboard" element={<SystemDashboardPage />} />
//                 <Route path="*" element={<Navigate to="/" replace />} />
//               </Routes>
//             </main>
//             <AIChatbot user={user} />
//           </>
//         ) : (
//           <>
//             <div className="bg-gradient" />
//             <header className="App-header">
//               <div className="brand">
//                 <h1 className="brand-title">DOIT</h1>
//                 <p className="brand-subtitle">Task management made simple</p>
//               </div>

//               <div className="glass-card">
//                 {authMode === "choice" && (
//                   <>
//                     <h2 className="section-title">Welcome! Choose how to sign in</h2>
//                     <div className="auth-choice-container">
//                       <button
//                         onClick={() => setAuthMode("clerk")}
//                         className="btn btn-social btn-full"
//                       >
//                         <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
//                           <path d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/>
//                         </svg>
//                         Continue with Google / Microsoft
//                       </button>
                      
//                       <div className="divider">
//                         <span>OR</span>
//                       </div>

//                       <button
//                         onClick={() => setAuthMode("traditional")}
//                         className="btn btn-secondary btn-full"
//                       >
//                         Continue with Email & Password
//                       </button>
//                     </div>
//                   </>
//                 )}

//                 {authMode === "clerk" && (
//                   <>
//                     <button
//                       onClick={() => setAuthMode("choice")}
//                       className="back-btn"
//                     >
//                       ← Back
//                     </button>
//                     <h2 className="section-title">
//                       {isLogin ? "Sign In" : "Sign Up"}
//                     </h2>
//                     <div className="clerk-container">
//                       {isLogin ? (
//                         <SignIn
//                           routing="hash"
//                           signUpUrl="#"
//                           appearance={{
//                             elements: {
//                               formButtonPrimary: "btn-primary",
//                               card: "clerk-card",
//                             },
//                           }}
//                         />
//                       ) : (
//                         <SignUp
//                           routing="hash"
//                           signInUrl="#"
//                           appearance={{
//                             elements: {
//                               formButtonPrimary: "btn-primary",
//                               card: "clerk-card",
//                             },
//                           }}
//                         />
//                       )}
//                     </div>
//                     <p className="switch-text">
//                       {isLogin
//                         ? "Don't have an account?"
//                         : "Already have an account?"}{" "}
//                       <span
//                         className="switch-link"
//                         onClick={() => setIsLogin(!isLogin)}
//                       >
//                         {isLogin ? "Sign Up" : "Sign In"}
//                       </span>
//                     </p>
//                   </>
//                 )}

//                 {authMode === "traditional" && (
//                   <>
//                     <button
//                       onClick={() => setAuthMode("choice")}
//                       className="back-btn"
//                     >
//                       ← Back
//                     </button>
//                     <div className="tab-toggle">
//                       <button
//                         type="button"
//                         className={`tab-btn ${isLogin ? "active" : ""}`}
//                         onClick={() => setIsLogin(true)}
//                       >
//                         Login
//                       </button>
//                       <button
//                         type="button"
//                         className={`tab-btn ${!isLogin ? "active" : ""}`}
//                         onClick={() => setIsLogin(false)}
//                       >
//                         Register
//                       </button>
//                     </div>

//                     <h2 className="section-title">
//                       {isLogin ? "Welcome back" : "Create your account"}
//                     </h2>

//                     <form onSubmit={handleSubmit} className="auth-form" noValidate>
//                       {!isLogin && (
//                         <div className="field">
//                           <label htmlFor="name">Full Name</label>
//                           <input
//                             id="name"
//                             type="text"
//                             placeholder="Enter your full name"
//                             value={name}
//                             onChange={(e) => handleFieldChange("name", e.target.value)}
//                             className={errors.name ? "error-input" : ""}
//                             required
//                           />
//                           {errors.name && (
//                             <span className="error-text">{errors.name}</span>
//                           )}
//                         </div>
//                       )}

//                       <div className="field">
//                         <label htmlFor="email">Email</label>
//                         <input
//                           id="email"
//                           type="email"
//                           placeholder="you@example.com"
//                           value={email}
//                           onChange={(e) => handleFieldChange("email", e.target.value)}
//                           className={errors.email ? "error-input" : ""}
//                           required
//                         />
//                         {errors.email && (
//                           <span className="error-text">{errors.email}</span>
//                         )}
//                       </div>

//                       <div className="field">
//                         <label htmlFor="password">Password</label>
//                         {isLogin ? (
//                           <input
//                             id="password"
//                             type="password"
//                             placeholder="••••••••"
//                             value={password}
//                             onChange={(e) =>
//                               handleFieldChange("password", e.target.value)
//                             }
//                             className={errors.password ? "error-input" : ""}
//                             required
//                           />
//                         ) : (
//                           <PasswordInput
//                             id="password"
//                             value={password}
//                             onChange={(value) => handleFieldChange("password", value)}
//                             placeholder="Create a strong password"
//                             showStrength={true}
//                             showRequirements={true}
//                           />
//                         )}
//                         {errors.password && (
//                           <span className="error-text">{errors.password}</span>
//                         )}
//                       </div>

//                       {!isLogin && (
//                         <div className="field">
//                           <label htmlFor="confirmPassword">Confirm Password</label>
//                           <input
//                             id="confirmPassword"
//                             type="password"
//                             placeholder="Re-enter your password"
//                             value={confirmPassword}
//                             onChange={(e) =>
//                               handleFieldChange("confirmPassword", e.target.value)
//                             }
//                             className={errors.confirmPassword ? "error-input" : ""}
//                             required
//                           />
//                           {errors.confirmPassword && (
//                             <span className="error-text">
//                               {errors.confirmPassword}
//                             </span>
//                           )}
//                         </div>
//                       )}

//                       <button type="submit" className="btn btn-primary full-width">
//                         {isLogin ? "Login" : "Register"}
//                       </button>
//                     </form>

//                     {error && <p className="message error">{error}</p>}
//                     {success && <p className="message success">{success}</p>}
//                   </>
//                 )}
//               </div>
//             </header>
//           </>
//         )}
//       </div>
//     </Router>
//   );
// }

// export default App;
// import React, { useContext, useState, useEffect } from "react";
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Navigate,
// } from "react-router-dom";
// import { AuthContext } from "./context/AuthContext";
// import { SignIn, SignUp, useAuth } from "@clerk/clerk-react";
// import { DashboardPage } from "./pages/Dashboard";
// import { ProjectsPage } from "./pages/Projects";
// import { TasksPage } from "./pages/Tasks";
// import { MyTasksPage } from "./pages/MyTasks";
// import SprintPage from "./pages/Sprints/SprintPage";
// import UsersPage from "./pages/Users/UsersPage";
// import { SuperAdminDashboard } from "./pages/SuperAdminDashboard";
// import SystemDashboardPage from "./pages/SystemDashboard/SystemDashboardPage";
// import AIChatbot from "./components/Chat/AIChatbot";
// import PasswordInput from "./components/Input/PasswordInput";
// import "./App.css";

// function App() {
//   const { user, loading, login, register, logout } = useContext(AuthContext);
//   const { isSignedIn } = useAuth();
//   const [authMode, setAuthMode] = useState("login"); // 'login', 'register', 'clerk-signin', 'clerk-signup'
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [name, setName] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [rememberMe, setRememberMe] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState("");
//   const [errors, setErrors] = useState({});
//   const [success, setSuccess] = useState("");

//   // Global Theme State
//   const [theme, setTheme] = useState(() => {
//     if (typeof window !== "undefined") {
//       return (
//         localStorage.getItem("app-theme") ||
//         (window.matchMedia("(prefers-color-scheme: dark)").matches
//           ? "dark"
//           : "light")
//       );
//     }
//     return "dark";
//   });

//   useEffect(() => {
//     document.documentElement.setAttribute("data-theme", theme);
//     localStorage.setItem("app-theme", theme);

//     const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
//     const handleChange = (e) => {
//       if (!localStorage.getItem("app-theme")) {
//         setTheme(e.matches ? "dark" : "light");
//       }
//     };
//     mediaQuery.addEventListener("change", handleChange);
//     return () => mediaQuery.removeEventListener("change", handleChange);
//   }, [theme]);

//   const toggleTheme = () => {
//     setTheme((prev) => (prev === "dark" ? "light" : "dark"));
//   };

//   useEffect(() => {
//     setName("");
//     setEmail("");
//     setPassword("");
//     setConfirmPassword("");
//     setError("");
//     setErrors({});
//     setSuccess("");
//     setShowPassword(false);
//   }, [authMode]);

//   const validateForm = () => {
//     const newErrors = {};

//     if (authMode === "register") {
//       if (!name.trim()) {
//         newErrors.name = "Name is required";
//       } else if (name.trim().length < 3) {
//         newErrors.name = "Name must be at least 3 characters";
//       }
//     }

//     if (!email.trim()) {
//       newErrors.email = "Enter an email address";
//     } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
//       newErrors.email = "Enter a valid email address";
//     }

//     if (!password) {
//       newErrors.password = "Enter a password";
//     }

//     if (authMode === "register") {
//       if (!confirmPassword) {
//         newErrors.confirmPassword = "Please confirm your password";
//       } else if (password !== confirmPassword) {
//         newErrors.confirmPassword = "Passwords do not match";
//       }
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async () => {
//     setError("");
//     setErrors({});
//     setSuccess("");

//     if (!validateForm()) {
//       return;
//     }

//     try {
//       if (authMode === "login") {
//         await login(email, password);
//         setSuccess("Logged in successfully!");
//       } else if (authMode === "register") {
//         await register(name, email, password, confirmPassword);
//         setSuccess("Registered and logged in!");
//       }

//       setName("");
//       setEmail("");
//       setPassword("");
//       setConfirmPassword("");
//     } catch (err) {
//       console.error("Auth error:", err);

//       const errorData = err.response?.data;

//       if (errorData?.error) {
//         if (typeof errorData.error === "object" && errorData.error.errors) {
//           setError(errorData.error.message || "Validation failed");
//         } else {
//           setError(errorData.error);
//         }
//       } else {
//         setError(err.message || "Something went wrong. Please try again.");
//       }
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter') {
//       handleSubmit();
//     }
//   };

//   const handleFieldChange = (field, value) => {
//     if (errors[field]) {
//       setErrors((prev) => ({ ...prev, [field]: undefined }));
//     }
//     if (error) {
//       setError("");
//     }

//     switch (field) {
//       case "name":
//         setName(value);
//         break;
//       case "email":
//         setEmail(value);
//         break;
//       case "password":
//         setPassword(value);
//         break;
//       case "confirmPassword":
//         setConfirmPassword(value);
//         break;
//       default:
//         break;
//     }
//   };

//   if (loading) {
//     return null;
//   }

//   return (
//     <Router>
//       <div className="App">
//         {user ? (
//           <>
//             <nav className="navbar">
//               <div className="nav-container">
//                 <div className="nav-brand">
//                   <div className="nav-brand-title">
//                     <a href="/">DOIT</a>
//                   </div>
//                 </div>

//                 <div className="nav-actions">
//                   <button
//                     onClick={toggleTheme}
//                     className="theme-toggle-btn"
//                     title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
//                   >
//                     {theme === "dark" ? "☀️" : "🌙"}
//                   </button>

//                   <div className="nav-user">
//                     <div className="user-avatar">
//                       {user.name.charAt(0).toUpperCase()}
//                     </div>
//                     <div className="user-info">
//                       <div className="user-name">{user.name}</div>
//                       <div className="user-role">
//                         {user.role === "super-admin"
//                           ? "Super Admin"
//                           : user.role.charAt(0).toUpperCase() +
//                             user.role.slice(1)}
//                       </div>
//                     </div>
//                     <button type="button" onClick={logout} className="btn-logout">
//                       Logout
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </nav>

//             <main style={{ paddingTop: "0px", minHeight: "calc(100vh - 80px)" }}>
//               <Routes>
//                 <Route
//                   path="/"
//                   element={
//                     user.role === "super-admin" ? (
//                       <SuperAdminDashboard />
//                     ) : (
//                       <DashboardPage />
//                     )
//                   }
//                 />
//                 <Route path="/dashboard" element={<DashboardPage />} />
//                 <Route path="/projects" element={<ProjectsPage />} />
//                 <Route path="/projects/:projectId/tasks" element={<TasksPage />} />
//                 <Route
//                   path="/projects/:projectId/sprints"
//                   element={<SprintPage />}
//                 />
//                 <Route path="/my-tasks" element={<MyTasksPage />} />
//                 <Route path="/users" element={<UsersPage />} />
//                 <Route path="/system-dashboard" element={<SystemDashboardPage />} />
//                 <Route path="*" element={<Navigate to="/" replace />} />
//               </Routes>
//             </main>
//             <AIChatbot user={user} />
//           </>
//         ) : (
//           <>
//             {/* Atlassian-Style Login/Register */}
//             <div style={{
//               minHeight: '100vh',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//               padding: '20px',
//               fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
//             }}>
//               <div style={{
//                 width: '100%',
//                 maxWidth: '400px',
//                 background: 'white',
//                 borderRadius: '8px',
//                 boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
//                 padding: '48px 40px',
//                 position: 'relative'
//               }}>
//                 {/* Logo */}
//                 <div style={{ textAlign: 'center', marginBottom: '32px' }}>
//                   <svg width="150" height="32" viewBox="0 0 150 32" fill="none">
//                     <text x="0" y="24" fill="#0052CC" fontSize="28" fontWeight="700" fontFamily="system-ui">
//                       DOIT
//                     </text>
//                   </svg>
//                 </div>

//                 {authMode === "clerk-signin" ? (
//                   <>
//                     {/* Clerk Social Sign In */}
//                     <button
//                       onClick={() => setAuthMode("login")}
//                       style={{
//                         background: 'transparent',
//                         border: 'none',
//                         color: '#0052CC',
//                         fontSize: '0.9rem',
//                         cursor: 'pointer',
//                         padding: '0.5rem',
//                         marginBottom: '1rem',
//                         display: 'flex',
//                         alignItems: 'center',
//                         gap: '0.5rem'
//                       }}
//                     >
//                       ← Back
//                     </button>
//                     <h1 style={{
//                       fontSize: '24px',
//                       fontWeight: '500',
//                       color: '#172B4D',
//                       textAlign: 'center',
//                       marginBottom: '32px',
//                       letterSpacing: '-0.01em'
//                     }}>
//                       Sign in with Social
//                     </h1>
//                     <div style={{ width: '100%' }}>
//                       <SignIn
//                         routing="hash"
//                         signUpUrl="#/sign-up"
//                         appearance={{
//                           elements: {
//                             rootBox: {
//                               width: '100%',
//                             },
//                             card: {
//                               boxShadow: 'none',
//                               border: 'none',
//                               padding: '0',
//                               width: '100%',
//                             },
//                             formButtonPrimary: {
//                               backgroundColor: '#0052CC',
//                               '&:hover': {
//                                 backgroundColor: '#0747A6',
//                               },
//                             },
//                           },
//                         }}
//                       />
//                     </div>
//                   </>
//                 ) : authMode === "clerk-signup" ? (
//                   <>
//                     {/* Clerk Social Sign Up */}
//                     <button
//                       onClick={() => setAuthMode("register")}
//                       style={{
//                         background: 'transparent',
//                         border: 'none',
//                         color: '#0052CC',
//                         fontSize: '0.9rem',
//                         cursor: 'pointer',
//                         padding: '0.5rem',
//                         marginBottom: '1rem',
//                         display: 'flex',
//                         alignItems: 'center',
//                         gap: '0.5rem'
//                       }}
//                     >
//                       ← Back
//                     </button>
//                     <h1 style={{
//                       fontSize: '24px',
//                       fontWeight: '500',
//                       color: '#172B4D',
//                       textAlign: 'center',
//                       marginBottom: '32px',
//                       letterSpacing: '-0.01em'
//                     }}>
//                       Create Account with Social
//                     </h1>
//                     <div style={{ width: '100%' }}>
//                       <SignUp
//                         routing="hash"
//                         signInUrl="#/sign-in"
//                         appearance={{
//                           elements: {
//                             rootBox: {
//                               width: '100%',
//                             },
//                             card: {
//                               boxShadow: 'none',
//                               border: 'none',
//                               padding: '0',
//                               width: '100%',
//                             },
//                             formButtonPrimary: {
//                               backgroundColor: '#0052CC',
//                               '&:hover': {
//                                 backgroundColor: '#0747A6',
//                               },
//                             },
//                           },
//                         }}
//                       />
//                     </div>
//                   </>
//                 ) : (
//                   <>
//                     {/* Title */}
//                     <h1 style={{
//                       fontSize: '24px',
//                       fontWeight: '500',
//                       color: '#172B4D',
//                       textAlign: 'center',
//                       marginBottom: '32px',
//                       letterSpacing: '-0.01em'
//                     }}>
//                       {authMode === "login" ? "Log in to continue" : "Create your account"}
//                     </h1>

//                     {/* Form */}
//                     <div>
//                       {/* Name Field (Register only) */}
//                       {authMode === "register" && (
//                         <div style={{ marginBottom: '16px' }}>
//                           <label style={{
//                             display: 'block',
//                             fontSize: '12px',
//                             fontWeight: '600',
//                             color: '#172B4D',
//                             marginBottom: '4px'
//                           }}>
//                             Full Name <span style={{ color: '#DE350B' }}>*</span>
//                           </label>
//                           <input
//                             type="text"
//                             value={name}
//                             onChange={(e) => handleFieldChange("name", e.target.value)}
//                             onKeyPress={handleKeyPress}
//                             placeholder="Enter your full name"
//                             style={{
//                               width: '100%',
//                               padding: '8px 12px',
//                               fontSize: '14px',
//                               border: errors.name ? '2px solid #DE350B' : '2px solid #DFE1E6',
//                               borderRadius: '3px',
//                               outline: 'none',
//                               transition: 'border-color 0.2s',
//                               backgroundColor: errors.name ? '#FFEBE6' : 'white',
//                               boxSizing: 'border-box'
//                             }}
//                             onFocus={(e) => {
//                               if (!errors.name) {
//                                 e.target.style.borderColor = '#0052CC';
//                               }
//                             }}
//                             onBlur={(e) => {
//                               if (!errors.name) {
//                                 e.target.style.borderColor = '#DFE1E6';
//                               }
//                             }}
//                           />
//                           {errors.name && (
//                             <div style={{
//                               display: 'flex',
//                               alignItems: 'center',
//                               gap: '4px',
//                               marginTop: '4px',
//                               fontSize: '12px',
//                               color: '#DE350B'
//                             }}>
//                               <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
//                                 <path d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm1 13H7v-2h2v2zm0-3H7V4h2v6z"/>
//                               </svg>
//                               {errors.name}
//                             </div>
//                           )}
//                         </div>
//                       )}

//                       {/* Email Field */}
//                       <div style={{ marginBottom: '16px' }}>
//                         <label style={{
//                           display: 'block',
//                           fontSize: '12px',
//                           fontWeight: '600',
//                           color: '#172B4D',
//                           marginBottom: '4px'
//                         }}>
//                           Email <span style={{ color: '#DE350B' }}>*</span>
//                         </label>
//                         <input
//                           type="email"
//                           value={email}
//                           onChange={(e) => handleFieldChange("email", e.target.value)}
//                           onKeyPress={handleKeyPress}
//                           placeholder="Enter your email"
//                           style={{
//                             width: '100%',
//                             padding: '8px 12px',
//                             fontSize: '14px',
//                             border: errors.email ? '2px solid #DE350B' : '2px solid #DFE1E6',
//                             borderRadius: '3px',
//                             outline: 'none',
//                             transition: 'border-color 0.2s',
//                             backgroundColor: errors.email ? '#FFEBE6' : 'white',
//                             boxSizing: 'border-box'
//                           }}
//                           onFocus={(e) => {
//                             if (!errors.email) {
//                               e.target.style.borderColor = '#0052CC';
//                             }
//                           }}
//                           onBlur={(e) => {
//                             if (!errors.email) {
//                               e.target.style.borderColor = '#DFE1E6';
//                             }
//                           }}
//                         />
//                         {errors.email && (
//                           <div style={{
//                             display: 'flex',
//                             alignItems: 'center',
//                             gap: '4px',
//                             marginTop: '4px',
//                             fontSize: '12px',
//                             color: '#DE350B'
//                           }}>
//                             <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
//                               <path d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm1 13H7v-2h2v2zm0-3H7V4h2v6z"/>
//                             </svg>
//                             {errors.email}
//                           </div>
//                         )}
//                       </div>

//                       {/* Password Field */}
//                       <div style={{ marginBottom: '12px' }}>
//                         <label style={{
//                           display: 'block',
//                           fontSize: '12px',
//                           fontWeight: '600',
//                           color: '#172B4D',
//                           marginBottom: '4px'
//                         }}>
//                           Password <span style={{ color: '#DE350B' }}>*</span>
//                         </label>
//                         <div style={{ position: 'relative' }}>
//                           <input
//                             type={showPassword ? 'text' : 'password'}
//                             value={password}
//                             onChange={(e) => handleFieldChange("password", e.target.value)}
//                             onKeyPress={handleKeyPress}
//                             placeholder="Enter your password"
//                             style={{
//                               width: '100%',
//                               padding: '8px 40px 8px 12px',
//                               fontSize: '14px',
//                               border: errors.password ? '2px solid #DE350B' : '2px solid #DFE1E6',
//                               borderRadius: '3px',
//                               outline: 'none',
//                               transition: 'border-color 0.2s',
//                               backgroundColor: errors.password ? '#FFEBE6' : 'white',
//                               boxSizing: 'border-box'
//                             }}
//                             onFocus={(e) => {
//                               if (!errors.password) {
//                                 e.target.style.borderColor = '#0052CC';
//                               }
//                             }}
//                             onBlur={(e) => {
//                               if (!errors.password) {
//                                 e.target.style.borderColor = '#DFE1E6';
//                               }
//                             }}
//                           />
//                           <button
//                             onClick={() => setShowPassword(!showPassword)}
//                             style={{
//                               position: 'absolute',
//                               right: '8px',
//                               top: '50%',
//                               transform: 'translateY(-50%)',
//                               background: 'none',
//                               border: 'none',
//                               cursor: 'pointer',
//                               padding: '4px',
//                               color: '#5E6C84',
//                               fontSize: '16px'
//                             }}
//                           >
//                             {showPassword ? '👁️' : '👁️‍🗨️'}
//                           </button>
//                         </div>
//                         {errors.password && (
//                           <div style={{
//                             display: 'flex',
//                             alignItems: 'center',
//                             gap: '4px',
//                             marginTop: '4px',
//                             fontSize: '12px',
//                             color: '#DE350B'
//                           }}>
//                             <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
//                               <path d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm1 13H7v-2h2v2zm0-3H7V4h2v6z"/>
//                             </svg>
//                             {errors.password}
//                           </div>
//                         )}
//                       </div>

//                       {/* Confirm Password (Register only) */}
//                       {authMode === "register" && (
//                         <div style={{ marginBottom: '12px' }}>
//                           <label style={{
//                             display: 'block',
//                             fontSize: '12px',
//                             fontWeight: '600',
//                             color: '#172B4D',
//                             marginBottom: '4px'
//                           }}>
//                             Confirm Password <span style={{ color: '#DE350B' }}>*</span>
//                           </label>
//                           <input
//                             type="password"
//                             value={confirmPassword}
//                             onChange={(e) => handleFieldChange("confirmPassword", e.target.value)}
//                             onKeyPress={handleKeyPress}
//                             placeholder="Re-enter your password"
//                             style={{
//                               width: '100%',
//                               padding: '8px 12px',
//                               fontSize: '14px',
//                               border: errors.confirmPassword ? '2px solid #DE350B' : '2px solid #DFE1E6',
//                               borderRadius: '3px',
//                               outline: 'none',
//                               transition: 'border-color 0.2s',
//                               backgroundColor: errors.confirmPassword ? '#FFEBE6' : 'white',
//                               boxSizing: 'border-box'
//                             }}
//                             onFocus={(e) => {
//                               if (!errors.confirmPassword) {
//                                 e.target.style.borderColor = '#0052CC';
//                               }
//                             }}
//                             onBlur={(e) => {
//                               if (!errors.confirmPassword) {
//                                 e.target.style.borderColor = '#DFE1E6';
//                               }
//                             }}
//                           />
//                           {errors.confirmPassword && (
//                             <div style={{
//                               display: 'flex',
//                               alignItems: 'center',
//                               gap: '4px',
//                               marginTop: '4px',
//                               fontSize: '12px',
//                               color: '#DE350B'
//                             }}>
//                               <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
//                                 <path d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm1 13H7v-2h2v2zm0-3H7V4h2v6z"/>
//                               </svg>
//                               {errors.confirmPassword}
//                             </div>
//                           )}
//                         </div>
//                       )}

//                       {/* Remember Me (Login only) */}
//                       {authMode === "login" && (
//                         <div style={{
//                           display: 'flex',
//                           alignItems: 'center',
//                           gap: '8px',
//                           marginBottom: '24px'
//                         }}>
//                           <input
//                             type="checkbox"
//                             id="remember"
//                             checked={rememberMe}
//                             onChange={(e) => setRememberMe(e.target.checked)}
//                             style={{
//                               width: '16px',
//                               height: '16px',
//                               cursor: 'pointer',
//                               accentColor: '#0052CC'
//                             }}
//                           />
//                           <label htmlFor="remember" style={{
//                             fontSize: '14px',
//                             color: '#172B4D',
//                             cursor: 'pointer',
//                             display: 'flex',
//                             alignItems: 'center',
//                             gap: '4px'
//                           }}>
//                             Remember me
//                             <span style={{
//                               display: 'inline-flex',
//                               alignItems: 'center',
//                               justifyContent: 'center',
//                               width: '16px',
//                               height: '16px',
//                               borderRadius: '50%',
//                               background: '#0052CC',
//                               color: 'white',
//                               fontSize: '10px',
//                               fontWeight: 'bold',
//                               cursor: 'help'
//                             }} title="Keep you logged in">
//                               i
//                             </span>
//                           </label>
//                         </div>
//                       )}

//                       {/* Error/Success Messages */}
//                       {error && (
//                         <div style={{
//                           padding: '12px',
//                           marginBottom: '16px',
//                           backgroundColor: '#FFEBE6',
//                           border: '1px solid #DE350B',
//                           borderRadius: '3px',
//                           color: '#DE350B',
//                           fontSize: '14px'
//                         }}>
//                           {error}
//                         </div>
//                       )}

//                       {success && (
//                         <div style={{
//                           padding: '12px',
//                           marginBottom: '16px',
//                           backgroundColor: '#E3FCEF',
//                           border: '1px solid #00875A',
//                           borderRadius: '3px',
//                           color: '#00875A',
//                           fontSize: '14px'
//                         }}>
//                           {success}
//                         </div>
//                       )}

//                       {/* Continue Button */}
//                       <button
//                         onClick={handleSubmit}
//                         style={{
//                           width: '100%',
//                           padding: '10px',
//                           background: '#0052CC',
//                           color: 'white',
//                           border: 'none',
//                           borderRadius: '3px',
//                           fontSize: '14px',
//                           fontWeight: '500',
//                           cursor: 'pointer',
//                           transition: 'background 0.2s',
//                           marginBottom: '16px'
//                         }}
//                         onMouseEnter={(e) => e.target.style.background = '#0747A6'}
//                         onMouseLeave={(e) => e.target.style.background = '#0052CC'}
//                       >
//                         {authMode === "login" ? "Continue" : "Create Account"}
//                       </button>

//                       {/* Divider */}
//                       <div style={{
//                         display: 'flex',
//                         alignItems: 'center',
//                         margin: '24px 0',
//                         gap: '12px'
//                       }}>
//                         <div style={{ flex: 1, height: '1px', background: '#DFE1E6' }}></div>
//                         <span style={{ fontSize: '12px', color: '#5E6C84', fontWeight: '500' }}>
//                           Or login with:
//                         </span>
//                         <div style={{ flex: 1, height: '1px', background: '#DFE1E6' }}></div>
//                       </div>

//                       {/* Social Login Buttons */}
//                       <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
//                         {/* Google */}
//                         <button
//                           onClick={() => setAuthMode(authMode === "login" ? "clerk-signin" : "clerk-signup")}
//                           style={{
//                             width: '100%',
//                             padding: '10px',
//                             background: 'white',
//                             border: '2px solid #DFE1E6',
//                             borderRadius: '3px',
//                             fontSize: '14px',
//                             fontWeight: '500',
//                             cursor: 'pointer',
//                             display: 'flex',
//                             alignItems: 'center',
//                             justifyContent: 'center',
//                             gap: '8px',
//                             color: '#172B4D',
//                             transition: 'all 0.2s'
//                           }}
//                           onMouseEnter={(e) => {
//                             e.target.style.background = '#F4F5F7';
//                             e.target.style.borderColor = '#B3BAC5';
//                           }}
//                           onMouseLeave={(e) => {
//                             e.target.style.background = 'white';
//                             e.target.style.borderColor = '#DFE1E6';
//                           }}
//                         >
//                           <svg width="18" height="18" viewBox="0 0 18 18">
//                             <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
//                             <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
//                             <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
//                             <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
//                           </svg>
//                           Google
//                         </button>

//                         {/* Microsoft */}
//                         <button
//                           onClick={() => setAuthMode(authMode === "login" ? "clerk-signin" : "clerk-signup")}
//                           style={{
//                             width: '100%',
//                             padding: '10px',
//                             background: 'white',
//                             border: '2px solid #DFE1E6',
//                             borderRadius: '3px',
//                             fontSize: '14px',
//                             fontWeight: '500',
//                             cursor: 'pointer',
//                             display: 'flex',
//                             alignItems: 'center',
//                             justifyContent: 'center',
//                             gap: '8px',
//                             color: '#172B4D',
//                             transition: 'all 0.2s'
//                           }}
//                           onMouseEnter={(e) => {
//                             e.target.style.background = '#F4F5F7';
//                             e.target.style.borderColor = '#B3BAC5';
//                           }}
//                           onMouseLeave={(e) => {
//                             e.target.style.background = 'white';
//                             e.target.style.borderColor = '#DFE1E6';
//                           }}
//                         >
//                           <svg width="18" height="18" viewBox="0 0 18 18">
//                             <path fill="#f25022" d="M0 0h8.571v8.571H0z"/>
//                             <path fill="#00a4ef" d="M9.429 0H18v8.571H9.429z"/>
//                             <path fill="#7fba00" d="M0 9.429h8.571V18H0z"/>
//                             <path fill="#ffb900" d="M9.429 9.429H18V18H9.429z"/>
//                           </svg>
//                           Microsoft
//                         </button>
//                       </div>
//                     </div>

//                     {/* Footer Links */}
//                     <div style={{
//                       marginTop: '32px',
//                       paddingTop: '24px',
//                       borderTop: '1px solid #DFE1E6',
//                       textAlign: 'center'
//                     }}>
//                       <p style={{
//                         fontSize: '14px',
//                         color: '#5E6C84',
//                         marginBottom: '12px'
//                       }}>
//                         {authMode === "login" ? (
//                           <>
//                             Don't have an account?{' '}
//                             <button
//                               onClick={() => setAuthMode("register")}
//                               style={{
//                                 background: 'none',
//                                 border: 'none',
//                                 color: '#0052CC',
//                                 cursor: 'pointer',
//                                 fontWeight: '500',
//                                 textDecoration: 'none',
//                                 fontSize: '14px'
//                               }}
//                               onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
//                               onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
//                             >
//                               Sign up
//                             </button>
//                           </>
//                         ) : (
//                           <>
//                             Already have an account?{' '}
//                             <button
//                               onClick={() => setAuthMode("login")}
//                               style={{
//                                 background: 'none',
//                                 border: 'none',
//                                 color: '#0052CC',
//                                 cursor: 'pointer',
//                                 fontWeight: '500',
//                                 textDecoration: 'none',
//                                 fontSize: '14px'
//                               }}
//                               onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
//                               onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
//                             >
//                               Log in
//                             </button>
//                           </>
//                         )}
//                       </p>
//                       <div style={{
//                         display: 'flex',
//                         gap: '16px',
//                         justifyContent: 'center',
//                         fontSize: '12px',
//                         color: '#5E6C84'
//                       }}>
//                         <a href="#" style={{ color: '#5E6C84', textDecoration: 'none' }}>
//                           Privacy Policy
//                         </a>
//                         <span>•</span>
//                         <a href="#" style={{ color: '#5E6C84', textDecoration: 'none' }}>
//                           Terms of Service
//                         </a>
//                       </div>
//                     </div>
//                   </>
//                 )}
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//     </Router>
//   );
// }

// export default App;
import React, { useContext, useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import { SignIn, SignUp, useAuth } from "@clerk/clerk-react";
import { DashboardPage } from "./pages/Dashboard";
import { ProjectsPage } from "./pages/Projects";
import { TasksPage } from "./pages/Tasks";
import { MyTasksPage } from "./pages/MyTasks";
import SprintPage from "./pages/Sprints/SprintPage";
import UsersPage from "./pages/Users/UsersPage";
import { SuperAdminDashboard } from "./pages/SuperAdminDashboard";
import SystemDashboardPage from "./pages/SystemDashboard/SystemDashboardPage";
import AIChatbot from "./components/Chat/AIChatbot";
import PasswordInput from "./components/Input/PasswordInput";
import "./App.css";

function App() {
  const { user, loading, login, register, logout } = useContext(AuthContext);
  const { isSignedIn } = useAuth();
  const [authMode, setAuthMode] = useState("choice"); // 'choice', 'clerk', 'traditional'
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

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

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setErrors({});
    setSuccess("");
    setShowPassword(false);
  }, [isLogin, authMode]);

  const validateForm = () => {
    const newErrors = {};

    if (!isLogin) {
      if (!name.trim()) {
        newErrors.name = "Name is required";
      } else if (name.trim().length < 3) {
        newErrors.name = "Name must be at least 3 characters";
      }
    }

    if (!email.trim()) {
      newErrors.email = "Enter an email address";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Enter a password";
    }

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
    setError("");
    setErrors({});
    setSuccess("");

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

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Auth error:", err);

      const errorData = err.response?.data;

      if (errorData?.error) {
        if (typeof errorData.error === "object" && errorData.error.errors) {
          setError(errorData.error.message || "Validation failed");
        } else {
          setError(errorData.error);
        }
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleFieldChange = (field, value) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (error) {
      setError("");
    }

    switch (field) {
      case "name":
        setName(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "password":
        setPassword(value);
        break;
      case "confirmPassword":
        setConfirmPassword(value);
        break;
      default:
        break;
    }
  };

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
                  <button
                    onClick={toggleTheme}
                    className="theme-toggle-btn"
                    title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
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
                    user.role === "super-admin" ? (
                      <SuperAdminDashboard />
                    ) : (
                      <DashboardPage />
                    )
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
          <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}>
            <div style={{
              width: '100%',
              maxWidth: '480px',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              padding: '48px 40px',
              position: 'relative'
            }}>
              {/* Back Button for Clerk and Traditional modes */}
              {(authMode === "clerk" || authMode === "traditional") && (
                <button
                  onClick={() => setAuthMode("choice")}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#0052CC',
                    fontSize: '14px',
                    cursor: 'pointer',
                    padding: '8px 0',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.gap = '10px';
                    e.target.style.color = '#0747A6';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.gap = '6px';
                    e.target.style.color = '#0052CC';
                  }}
                >
                  <span style={{ fontSize: '18px' }}>←</span> Back
                </button>
              )}

              {/* Brand Header */}
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{
                  fontSize: '42px',
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #0052CC 0%, #667eea 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '2px'
                }}>
                  DOIT
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#5E6C84',
                  marginTop: '8px',
                  fontWeight: '400'
                }}>
                  Modern Project Management
                </div>
              </div>

              {/* Choice Screen */}
              {authMode === "choice" && (
                <>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    color: '#172B4D',
                    textAlign: 'center',
                    marginBottom: '32px',
                    letterSpacing: '-0.02em'
                  }}>
                    Welcome! Choose how to sign in
                  </h2>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <button
                      onClick={() => setAuthMode("clerk")}
                      style={{
                        width: '100%',
                        padding: '14px 20px',
                        background: 'linear-gradient(135deg, #0052CC 0%, #0065FF 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '15px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        transition: 'all 0.2s',
                        boxShadow: '0 4px 12px rgba(0,82,204,0.25)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 20px rgba(0,82,204,0.35)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 12px rgba(0,82,204,0.25)';
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/>
                      </svg>
                      Continue with Google / Microsoft
                    </button>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      margin: '8px 0',
                      gap: '12px'
                    }}>
                      <div style={{ flex: 1, height: '1px', background: '#DFE1E6' }}></div>
                      <span style={{ fontSize: '12px', color: '#5E6C84', fontWeight: '500' }}>
                        OR
                      </span>
                      <div style={{ flex: 1, height: '1px', background: '#DFE1E6' }}></div>
                    </div>

                    <button
                      onClick={() => setAuthMode("traditional")}
                      style={{
                        width: '100%',
                        padding: '14px 20px',
                        background: 'white',
                        border: '2px solid #DFE1E6',
                        borderRadius: '6px',
                        fontSize: '15px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        color: '#172B4D',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#F4F5F7';
                        e.target.style.borderColor = '#B3BAC5';
                        e.target.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'white';
                        e.target.style.borderColor = '#DFE1E6';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      Continue with Email & Password
                    </button>
                  </div>
                </>
              )}

              {/* Clerk Auth Mode */}
              {authMode === "clerk" && (
                <>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    color: '#172B4D',
                    textAlign: 'center',
                    marginBottom: '24px',
                    letterSpacing: '-0.02em'
                  }}>
                    {isLogin ? "Sign In" : "Sign Up"}
                  </h2>

                  <div style={{ marginBottom: '20px' }}>
                    {isLogin ? (
                      <SignIn
                        routing="hash"
                        signUpUrl="#"
                        appearance={{
                          elements: {
                            formButtonPrimary: "btn-primary",
                            card: "clerk-card",
                          },
                        }}
                      />
                    ) : (
                      <SignUp
                        routing="hash"
                        signInUrl="#"
                        appearance={{
                          elements: {
                            formButtonPrimary: "btn-primary",
                            card: "clerk-card",
                          },
                        }}
                      />
                    )}
                  </div>

                  <p style={{
                    textAlign: 'center',
                    fontSize: '14px',
                    color: '#5E6C84',
                    marginTop: '20px'
                  }}>
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                    <button
                      onClick={() => setIsLogin(!isLogin)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#0052CC',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '14px'
                      }}
                      onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                    >
                      {isLogin ? "Sign Up" : "Sign In"}
                    </button>
                  </p>
                </>
              )}

              {/* Traditional Email/Password Mode */}
              {authMode === "traditional" && (
                <>
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '32px',
                    background: '#F4F5F7',
                    padding: '4px',
                    borderRadius: '8px'
                  }}>
                    <button
                      type="button"
                      onClick={() => setIsLogin(true)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: isLogin ? 'white' : 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: isLogin ? '#0052CC' : '#5E6C84',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: isLogin ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                      }}
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsLogin(false)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: !isLogin ? 'white' : 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: !isLogin ? '#0052CC' : '#5E6C84',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: !isLogin ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                      }}
                    >
                      Register
                    </button>
                  </div>

                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    color: '#172B4D',
                    textAlign: 'center',
                    marginBottom: '32px',
                    letterSpacing: '-0.02em'
                  }}>
                    {isLogin ? "Welcome back" : "Create your account"}
                  </h2>

                  <form onSubmit={handleSubmit} noValidate>
                    {!isLogin && (
                      <div style={{ marginBottom: '20px' }}>
                        <label style={{
                          display: 'block',
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#172B4D',
                          marginBottom: '6px'
                        }}>
                          Full Name <span style={{ color: '#DE350B' }}>*</span>
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => handleFieldChange("name", e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Enter your full name"
                          style={{
                            width: '100%',
                            padding: '12px 14px',
                            fontSize: '15px',
                            border: errors.name ? '2px solid #DE350B' : '2px solid #DFE1E6',
                            borderRadius: '6px',
                            outline: 'none',
                            transition: 'all 0.2s',
                            backgroundColor: errors.name ? '#FFEBE6' : 'white',
                            boxSizing: 'border-box'
                          }}
                          onFocus={(e) => {
                            if (!errors.name) {
                              e.target.style.borderColor = '#0052CC';
                              e.target.style.boxShadow = '0 0 0 3px rgba(0,82,204,0.1)';
                            }
                          }}
                          onBlur={(e) => {
                            if (!errors.name) {
                              e.target.style.borderColor = '#DFE1E6';
                              e.target.style.boxShadow = 'none';
                            }
                          }}
                        />
                        {errors.name && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            marginTop: '6px',
                            fontSize: '13px',
                            color: '#DE350B'
                          }}>
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm1 13H7v-2h2v2zm0-3H7V4h2v6z"/>
                            </svg>
                            {errors.name}
                          </div>
                        )}
                      </div>
                    )}

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#172B4D',
                        marginBottom: '6px'
                      }}>
                        Email <span style={{ color: '#DE350B' }}>*</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => handleFieldChange("email", e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="you@example.com"
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          fontSize: '15px',
                          border: errors.email ? '2px solid #DE350B' : '2px solid #DFE1E6',
                          borderRadius: '6px',
                          outline: 'none',
                          transition: 'all 0.2s',
                          backgroundColor: errors.email ? '#FFEBE6' : 'white',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => {
                          if (!errors.email) {
                            e.target.style.borderColor = '#0052CC';
                            e.target.style.boxShadow = '0 0 0 3px rgba(0,82,204,0.1)';
                          }
                        }}
                        onBlur={(e) => {
                          if (!errors.email) {
                            e.target.style.borderColor = '#DFE1E6';
                            e.target.style.boxShadow = 'none';
                          }
                        }}
                      />
                      {errors.email && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginTop: '6px',
                          fontSize: '13px',
                          color: '#DE350B'
                        }}>
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm1 13H7v-2h2v2zm0-3H7V4h2v6z"/>
                          </svg>
                          {errors.email}
                        </div>
                      )}
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#172B4D',
                        marginBottom: '6px'
                      }}>
                        Password <span style={{ color: '#DE350B' }}>*</span>
                      </label>
                      {isLogin ? (
                        <div style={{ position: 'relative' }}>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => handleFieldChange("password", e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="••••••••"
                            style={{
                              width: '100%',
                              padding: '12px 44px 12px 14px',
                              fontSize: '15px',
                              border: errors.password ? '2px solid #DE350B' : '2px solid #DFE1E6',
                              borderRadius: '6px',
                              outline: 'none',
                              transition: 'all 0.2s',
                              backgroundColor: errors.password ? '#FFEBE6' : 'white',
                              boxSizing: 'border-box'
                            }}
                            onFocus={(e) => {
                              if (!errors.password) {
                                e.target.style.borderColor = '#0052CC';
                                e.target.style.boxShadow = '0 0 0 3px rgba(0,82,204,0.1)';
                              }
                            }}
                            onBlur={(e) => {
                              if (!errors.password) {
                                e.target.style.borderColor = '#DFE1E6';
                                e.target.style.boxShadow = 'none';
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                              position: 'absolute',
                              right: '12px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '6px',
                              color: '#5E6C84',
                              fontSize: '18px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '4px',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#F4F5F7'}
                            onMouseLeave={(e) => e.target.style.background = 'none'}
                          >
                            {showPassword ? '👁️' : '👁️‍🗨️'}
                          </button>
                        </div>
                      ) : (
                        <PasswordInput
                          id="password"
                          value={password}
                          onChange={(value) => handleFieldChange("password", value)}
                          placeholder="Create a strong password"
                          showStrength={true}
                          showRequirements={true}
                        />
                      )}
                      {errors.password && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginTop: '6px',
                          fontSize: '13px',
                          color: '#DE350B'
                        }}>
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm1 13H7v-2h2v2zm0-3H7V4h2v6z"/>
                          </svg>
                          {errors.password}
                        </div>
                      )}
                    </div>

                    {!isLogin && (
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{
                          display: 'block',
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#172B4D',
                          marginBottom: '6px'
                        }}>
                          Confirm Password <span style={{ color: '#DE350B' }}>*</span>
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => handleFieldChange("confirmPassword", e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Re-enter your password"
                          style={{
                            width: '100%',
                            padding: '12px 14px',
                            fontSize: '15px',
                            border: errors.confirmPassword ? '2px solid #DE350B' : '2px solid #DFE1E6',
                            borderRadius: '6px',
                            outline: 'none',
                            transition: 'all 0.2s',
                            backgroundColor: errors.confirmPassword ? '#FFEBE6' : 'white',
                            boxSizing: 'border-box'
                          }}
                          onFocus={(e) => {
                            if (!errors.confirmPassword) {
                              e.target.style.borderColor = '#0052CC';
                              e.target.style.boxShadow = '0 0 0 3px rgba(0,82,204,0.1)';
                            }
                          }}
                          onBlur={(e) => {
                            if (!errors.confirmPassword) {
                              e.target.style.borderColor = '#DFE1E6';
                              e.target.style.boxShadow = 'none';
                            }
                          }}
                        />
                        {errors.confirmPassword && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            marginTop: '6px',
                            fontSize: '13px',
                            color: '#DE350B'
                          }}>
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm1 13H7v-2h2v2zm0-3H7V4h2v6z"/>
                            </svg>
                            {errors.confirmPassword}
                          </div>
                        )}
                      </div>
                    )}

                    {isLogin && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '24px'
                      }}>
                        <input
                          type="checkbox"
                          id="remember"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          style={{
                            width: '16px',
                            height: '16px',
                            cursor: 'pointer',
                            accentColor: '#0052CC'
                          }}
                        />
                        <label htmlFor="remember" style={{
                          fontSize: '14px',
                          color: '#172B4D',
                          cursor: 'pointer'
                        }}>
                          Remember me
                        </label>
                      </div>
                    )}

                    {error && (
                      <div style={{
                        padding: '14px 16px',
                        marginBottom: '16px',
                        backgroundColor: '#FFEBE6',
                        border: '1px solid #DE350B',
                        borderRadius: '6px',
                        color: '#DE350B',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm1 13H7v-2h2v2zm0-3H7V4h2v6z"/>
                        </svg>
                        {error}
                      </div>
                    )}

                    {success && (
                      <div style={{
                        padding: '14px 16px',
                        marginBottom: '16px',
                        backgroundColor: '#E3FCEF',
                        border: '1px solid #00875A',
                        borderRadius: '6px',
                        color: '#00875A',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm6.2 5.8L7 12.9l-3.7-3.7 1.4-1.4L7 10.1l5.8-5.8 1.4 1.5z"/>
                        </svg>
                        {success}
                      </div>
                    )}

                    <button
                      type="submit"
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'linear-gradient(135deg, #0052CC 0%, #0065FF 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '15px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: '0 4px 12px rgba(0,82,204,0.25)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 20px rgba(0,82,204,0.35)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 12px rgba(0,82,204,0.25)';
                      }}
                    >
                      {isLogin ? "Login" : "Register"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;