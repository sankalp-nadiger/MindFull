import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./StudentSignIn.css";
import Toast from "./Toast";

const StudentSignIn = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "info" });
  const [fieldError, setFieldError] = useState({ username: false, password: false, mood: false });
  const [errorCount, setErrorCount] = useState(0);

  // Email/username validation (basic: at least 3 chars, no spaces)
  const validateUsername = (username) => username && username.length >= 3 && !username.includes(" ");

  const showErrorToast = (msg) => {
    setErrorCount((prev) => prev + 1);
    const suffix = errorCount >= 2 ? " If the issue persists, please contact the developer." : "";
    setToast({ message: msg + suffix, type: "error" });
  };

  const handleSignIn = async (event) => {
    event.preventDefault();
    setFieldError({ username: false, password: false, mood: false });

    const username = event.target.username.value.trim();
    const password = event.target.password.value;
    const mood = event.target.mood.value;
    sessionStorage.setItem("password", password);

    // Validate fields
    let hasError = false;
    if (!validateUsername(username)) {
      setFieldError((prev) => ({ ...prev, username: true }));
      showErrorToast("Please enter a valid username.");
      hasError = true;
    }
    if (!password) {
      setFieldError((prev) => ({ ...prev, password: true }));
      showErrorToast("Password is required.");
      hasError = true;
    }
    if (!mood) {
      setFieldError((prev) => ({ ...prev, mood: true }));
      showErrorToast("Please select your mood.");
      hasError = true;
    }
    if (hasError) return;

    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_API_URL}/users/login`, {
        username,
        password,
        mood
      });
      if (response.status === 200) {
        const { user, accessToken, streak, maxStreak, suggestedActivity } = response.data.data;
        sessionStorage.setItem("accessToken", accessToken);
        sessionStorage.setItem("user", JSON.stringify(user));
        sessionStorage.setItem("mood", mood);
        sessionStorage.setItem("activity", JSON.stringify(suggestedActivity));
        setToast({
          message: `Welcome back, ${user.username}! Your streak: ${streak}, Max streak: ${maxStreak}`,
          type: "success"
        });
        setTimeout(() => navigate("/MainPage"), 1200);
      } else {
        setToast({ message: "Login failed. Please try again.", type: "error" });
      }
    } catch (error) {
      setToast({
        message: error.response?.data?.message || "An error occurred during login. Please try again.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "info" })} />
      <div className="auth-container">
        <a className="flex items-center flex-shrink-0 font-medium text-gray-900 transition-all duration-300 title-font group hover:scale-105" style={{ marginBottom: '1rem' }}>
          <div className="relative">
            <img src="plant.png" alt="Logo" className="w-8 h-8 transition-transform duration-300 group-hover:rotate-12" />
            <div className="absolute inset-0 transition-opacity duration-300 rounded-full opacity-0 bg-gradient-to-r from-blue-400/20 to-green-400/20 group-hover:opacity-100 blur-sm"></div>
          </div>
          <span className="ml-3 text-3xl font-bold tracking-wide text-transparent bg-gradient-to-r from-blue-400 via-teal-400 to-green-400 bg-clip-text">
            MindFull
          </span>
        </a>
        <div className="auth-card">
          <div className="card-header">
            <img
              src="https://media.giphy.com/media/hvRJCLFzcasrR4ia7z/giphy.gif"
              alt="Welcome GIF"
              className="welcome-animation"
            />
            <h2 className="card-title">Student Sign In</h2>
          </div>
          <form onSubmit={handleSignIn} className="form-container">
            <div className="form-group">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                className={`form-input${fieldError.username ? " error" : ""}`}
                placeholder="Enter your username"
                autoComplete="username"
              />
              {fieldError.username && <div className="error-message">Invalid username.</div>}
            </div>
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="input-with-button">
                <input
                  type={passwordVisible ? "text" : "password"}
                  id="password"
                  name="password"
                  className={`form-input${fieldError.password ? " error" : ""}`}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="input-button"
                >
                  {passwordVisible ? "Hide" : "Show"}
                </button>
              </div>
              {fieldError.password && <div className="error-message">Password is required.</div>}
            </div>
            <div className="form-group">
              <label htmlFor="mood" className="form-label">How are you feeling today?</label>
              <select
                id="mood"
                name="mood"
                className={`form-input select-input${fieldError.mood ? " error" : ""}`}
                required
              >
                <option value="">Select your mood</option>
                <option value="Happy">😊 Happy</option>
                <option value="Sad">😢 Sad</option>
                <option value="Excited">🤩 Excited</option>
                <option value="Tired">😴 Tired</option>
                <option value="Angry">😡 Angry</option>
              </select>
              {fieldError.mood && <div className="error-message">Please select your mood.</div>}
            </div>
            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
          <div className="auth-links">
            <p>
              Don't have an account?{" "}
              <Link to="/student-signup" className="auth-link">
                Sign up here
              </Link>
            </p>
            <p>
              Not a student?{" "}
              <Link to="/role-selection" className="auth-link">
                Select your role
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSignIn;