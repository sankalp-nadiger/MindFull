import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./StudentSignIn.css"; // Make sure to create this file with the CSS content

const StudentSignIn = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleSignIn = async (event) => {
    event.preventDefault();

    // Collect form data
    const username = event.target.username.value;
    const password = event.target.password.value;
    sessionStorage.setItem("password", password);
    const mood = event.target.mood.value;

    // Validate fields
    if (!password || !mood || !username) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      // API call to backend login endpoint
      const response = await axios.post(`${import.meta.env.VITE_BASE_API_URL}/users/login`, {
        username,
        password,
        mood
      });

      if (response.status === 200) {
        const { user, accessToken, streak, maxStreak, suggestedActivity } =
          response.data.data;

        console.log("Login successful:", response.data);
        
        // Save user data and tokens
        sessionStorage.setItem("accessToken", accessToken);
        sessionStorage.setItem("user", JSON.stringify(user));
        sessionStorage.setItem("mood", mood);
        sessionStorage.setItem("activity", JSON.stringify(suggestedActivity));

        // Display streak and suggested activity
        alert(
          `Welcome back, ${user.username}!\nYour streak: ${streak}\nMax streak: ${maxStreak}\n`
        );

        // Redirect to dashboard
        navigate("/MainPage");
      } else {
        alert("Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error.response?.data?.message || error.message);
      alert(
        error.response?.data?.message || "An error occurred during login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
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
              className="form-input"
              placeholder="Enter your username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="input-with-button">
              <input
                type={passwordVisible ? "text" : "password"}
                id="password"
                name="password"
                className="form-input"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setPasswordVisible(!passwordVisible)}
                className="input-button"
              >
                {passwordVisible ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="mood" className="form-label">How are you feeling today?</label>
            <select
              id="mood"
              name="mood"
              className="form-input select-input"
              required
            >
              <option value="">Select your mood</option>
              <option value="Happy">😊 Happy</option>
              <option value="Sad">😢 Sad</option>
              <option value="Excited">🤩 Excited</option>
              <option value="Tired">😴 Tired</option>
              <option value="Angry">😡 Angry</option>
            </select>
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