import { useContext, useState } from "react";
import { AuthContext } from "./context/AuthContext";
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
      // Reset form
      setName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  };

  if (loading) {
    return <div className="App">Loading...</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Mini Jira - Task Management</h1>

        {user ? (
          <>
            <h2>Welcome, {user.name}!</h2>
            <p>Email: {user.email}</p>
            <p>Role: {user.role}</p>
            <button onClick={logout} className="btn">
              Logout
            </button>
          </>
        ) : (
          <>
            <h2>{isLogin ? "Login" : "Register"}</h2>

            <form onSubmit={handleSubmit} className="auth-form">
              {!isLogin && (
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              )}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit" className="btn">
                {isLogin ? "Login" : "Register"}
              </button>
            </form>

            <p>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span
                className="App-link"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                  setSuccess("");
                }}
                style={{ cursor: "pointer" }}
              >
                {isLogin ? "Register here" : "Login here"}
              </span>
            </p>
          </>
        )}

        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}
      </header>
    </div>
  );
}

export default App;