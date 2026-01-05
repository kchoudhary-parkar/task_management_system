// import { useContext, useState } from "react";
// import { AuthContext } from "./context/AuthContext";
import "./App.css";

// function App() {
//   const { user, loading, login, register, logout } = useContext(AuthContext);
//   const [isLogin, setIsLogin] = useState(true);
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setSuccess("");

//     try {
//       if (isLogin) {
//         await login(email, password);
//         setSuccess("Logged in successfully!");
//       } else {
//         await register(name, email, password);
//         setSuccess("Registered and logged in!");
//       }
//       // Reset form
//       setName("");
//       setEmail("");
//       setPassword("");
//     } catch (err) {
//       setError(err.response?.data?.error || "Something went wrong");
//     }
//   };

//   if (loading) {
//     return <div className="App">Loading...</div>;
//   }

//   return (
//     <div className="App">
//       <header className="App-header">
//         <h1>Mini Jira - Task Management</h1>

//         {user ? (
//           <>
//             <h2>Welcome, {user.name}!</h2>
//             <p>Email: {user.email}</p>
//             <p>Role: {user.role}</p>
//             <button onClick={logout} className="btn">
//               Logout
//             </button>
//           </>
//         ) : (
//           <>
//             <h2>{isLogin ? "Login" : "Register"}</h2>

//             <form onSubmit={handleSubmit} className="auth-form">
//               {!isLogin && (
//                 <input
//                   type="text"
//                   placeholder="Full Name"
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   required
//                 />
//               )}
//               <input
//                 type="email"
//                 placeholder="Email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//               />
//               <input
//                 type="password"
//                 placeholder="Password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//               />
//               <button type="submit" className="btn">
//                 {isLogin ? "Login" : "Register"}
//               </button>
//             </form>

//             <p>
//               {isLogin ? "Don't have an account? " : "Already have an account? "}
//               <span
//                 className="App-link"
//                 onClick={() => {
//                   setIsLogin(!isLogin);
//                   setError("");
//                   setSuccess("");
//                 }}
//                 style={{ cursor: "pointer" }}
//               >
//                 {isLogin ? "Register here" : "Login here"}
//               </span>
//             </p>
//           </>
//         )}

//         {error && <p style={{ color: "red" }}>{error}</p>}
//         {success && <p style={{ color: "green" }}>{success}</p>}
//       </header>
//     </div>
//   );
// }

// export default App;

// import { useContext, useState } from "react";
// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import { AuthContext } from "./context/AuthContext";
// import { ProjectsPage } from "./pages/Projects";
// import { TasksPage } from "./pages/Tasks";
// import "./App.css";

// function App() {
//   const { user, loading, login, register, logout } = useContext(AuthContext);
//   const [isLogin, setIsLogin] = useState(true);
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setSuccess("");

//     try {
//       if (isLogin) {
//         await login(email, password);
//         setSuccess("Logged in successfully!");
//       } else {
//         await register(name, email, password);
//         setSuccess("Registered and logged in!");
//       }
//       setName("");
//       setEmail("");
//       setPassword("");
//     } catch (err) {
//       setError(err.response?.data?.error || "Something went wrong");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="App App-center">
//         <div className="glass-card">
//           <p className="loading-text">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <Router>
//       <div className="App">
//         {user ? (
//           // Logged in - Show Projects Page
//           <div>
//             <nav className="navbar">
//               <h1>Mini Jira - Task Management</h1>
//               <div className="nav-user">
//                 <span>Welcome, {user.name}!</span>
//                 <button onClick={logout} className="btn btn-logout">
//                   Logout
//                 </button>
//               </div>
//             </nav>
//             <Routes>
//               <Route path="/" element={<Navigate to="/projects" replace />} />
//               <Route path="/projects" element={<ProjectsPage />} />
//               <Route path="/projects/:projectId/tasks" element={<TasksPage />} />
//               <Route path="*" element={<Navigate to="/projects" replace />} />
//             </Routes>
//           </div>
//         ) : (
//         // Not logged in - Show Auth Form
//         <>
//           <div className="bg-gradient" />
//           <header className="App-header">
//             <div className="brand">
//               <h1 className="brand-title">Mini Jira</h1>
//               <p className="brand-subtitle">Task management made simple</p>
//             </div>

//             <div className="glass-card">
//               <div className="tab-toggle">
//                 <button
//                   type="button"
//                   className={`tab-btn ${isLogin ? "active" : ""}`}
//                   onClick={() => {
//                     setIsLogin(true);
//                     setError("");
//                     setSuccess("");
//                   }}
//                 >
//                   Login
//                 </button>
//                 <button
//                   type="button"
//                   className={`tab-btn ${!isLogin ? "active" : ""}`}
//                   onClick={() => {
//                     setIsLogin(false);
//                     setError("");
//                     setSuccess("");
//                   }}
//                 >
//                   Register
//                 </button>
//               </div>

//               <h2 className="section-title">
//                 {isLogin ? "Welcome back" : "Create your account"}
//               </h2>

//               <form onSubmit={handleSubmit} className="auth-form">
//                 {!isLogin && (
//                   <div className="field">
//                     <label>Full Name</label>
//                     <input
//                       type="text"
//                       placeholder="Enter your full name"
//                       value={name}
//                       onChange={(e) => setName(e.target.value)}
//                       required
//                     />
//                   </div>
//                 )}

//                 <div className="field">
//                   <label>Email</label>
//                   <input
//                     type="email"
//                     placeholder="you@example.com"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     required
//                   />
//                 </div>

//                 <div className="field">
//                   <label>Password</label>
//                   <input
//                     type="password"
//                     placeholder="••••••••"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     required
//                   />
//                 </div>

//                 <button type="submit" className="btn btn-primary full-width">
//                   {isLogin ? "Login" : "Register"}
//                 </button>
//               </form>

//               <p className="switch-text">
//                 {isLogin
//                   ? "Don't have an account?"
//                   : "Already have an account?"}{" "}
//                 <span
//                   className="switch-link"
//                   onClick={() => {
//                     setIsLogin(!isLogin);
//                     setError("");
//                     setSuccess("");
//                   }}
//                 >
//                   {isLogin ? "Register here" : "Login here"}
//                 </span>
//               </p>

//               {error && <p className="message error">{error}</p>}
//               {success && <p className="message success">{success}</p>}
//             </div>
//           </header>
//         </>
//       )}
//       </div>
//     </Router>
//   );
// }

// export default App;

import { useContext, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import { DashboardPage } from "./pages/Dashboard";
import { ProjectsPage } from "./pages/Projects";
import { TasksPage } from "./pages/Tasks";
import { MyTasksPage } from "./pages/MyTasks";
import SprintPage from "./pages/Sprints/SprintPage";
import UsersPage from "./pages/Users/UsersPage";
import "./App.css";

function App() {
  const { user, loading, login, register, logout } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (isLogin) {
        await login(email, password);
        setSuccess("Logged in successfully!");
      } else {
        await register(name, email, password);
        setSuccess("Registered and logged in!");
      }
      setName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  };

  if (loading) {
    return (
      <div className="App App-center">
        <div className="glass-card">
          <p className="loading-text">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {user ? (
          // Logged in - Show Navbar + Routes
          <>
            <nav className="navbar">
              <div className="nav-container">
                <div className="nav-brand">
                  <div className="nav-brand-title"><a href="/frontend/src/pages/Dashboard/index.js">DOIT</a></div>
                </div>
                <div className="nav-user" data-role={user.role}>
                  <div className="user-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-info">
                    <div className="user-name">{user.name}</div>
                    <div className="user-role">
                      {user.role === "super-admin" ? "Super Admin" : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </div>
                  </div>
                  <button onClick={logout} className="btn-logout">
                    Logout
                  </button>
                </div>
              </div>
            </nav>

            {/* Main content with padding for navbar */}
            <main style={{ paddingTop: '80px', minHeight: 'calc(100vh - 80px)' }}>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/projects/:projectId/tasks" element={<TasksPage />} />
                <Route path="/projects/:projectId/sprints" element={<SprintPage />} />
                <Route path="/my-tasks" element={<MyTasksPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </>
        ) : (
          // Not logged in - Show Auth Form
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
                    onClick={() => {
                      setIsLogin(true);
                      setError("");
                      setSuccess("");
                    }}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    className={`tab-btn ${!isLogin ? "active" : ""}`}
                    onClick={() => {
                      setIsLogin(false);
                      setError("");
                      setSuccess("");
                    }}
                  >
                    Register
                  </button>
                </div>

                <h2 className="section-title">
                  {isLogin ? "Welcome back" : "Create your account"}
                </h2>

                <form onSubmit={handleSubmit} className="auth-form">
                  {!isLogin && (
                    <div className="field">
                      <label>Full Name</label>
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  <div className="field">
                    <label>Email</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="field">
                    <label>Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

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
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError("");
                      setSuccess("");
                    }}
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
