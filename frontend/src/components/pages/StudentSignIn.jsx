import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./StudentSignIn.css";
import Toast from "./Toast";
import { motion } from "framer-motion";
import { CheckCircle2, User, Shield, Star } from 'lucide-react';

const roles = [
  {
    id: "user",
    name: "User",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="blue" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-icon lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
    ),
  },
  {
    id: "parent",
    name: "Parent",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="blue" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users-icon lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M16 3.128a4 4 0 0 1 0 7.744" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" /></svg>
    ),
  },
  {
    id: "counsellor",
    name: "Counsellor",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="blue" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users-round-icon lucide-users-round"><path d="M18 21a8 8 0 0 0-16 0" /><circle cx="10" cy="8" r="5" /><path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3" /></svg>
    ),
  },
];

const StudentSignIn = () => {
  const [selectedRole, setSelectedRole] = useState("user");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "info" });
  const [fieldError, setFieldError] = useState({ username: false, password: false, mood: false });
  const [errorCount, setErrorCount] = useState(0);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submit
      const form = e.target.form;
      const index = Array.prototype.indexOf.call(form, e.target);
      const nextElement = form.elements[index + 1];
      if (nextElement) {
        nextElement.focus();
      }
    }
  };

  const handleRoleClick = (roleId) => {
    setSelectedRole(roleId);

    // Navigate to appropriate route
    switch (roleId) {
      case 'user':
        break;
      case 'parent':
        navigate('/parent-signin');
        break;
      case 'counsellor':
        navigate('/counsellor-signin');
        break;
      default:
        break;
    }
  };

  

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
    <>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "info" })} />
      <div className="min-h-screen font-poppins bg-gradient-to-b from-green-400 via-green-200 to-blue-300 flex items-center justify-center p-4 ">
       

      

    
        <div className="relative w-full max-w-6xl bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden ">
          <div className="flex flex-col-reverse lg:flex-row min-h-[600px] ">

           
            <div className="lg:w-1/2 bg-white p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">

             
              <div className="absolute top-10 right-10 w-20 h-20 bg-green-600/50 rounded-full animate-bounce delay-300"></div>



              
              <div className="relative z-10">
                <div className="flex items-center mb-8">
                  <div className="w-16 h-12 bg-green/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                    <div className="w-20 h-6 border-2 border-white rounded-full flex items-center justify-center">
                      <img
                        src="/1a.png"
                        className="w-auto lg:h-16 h-10"
                        alt="Logo"
                      />
                    </div>
                  </div>
                  <span className="ml-3 text-green-900 text-3xl font-bold tracking-wide">Soulynk</span>
                </div>

                <h1 className="text-4xl lg:text-5xl font-bold text-primarygreen mb-6 leading-tight">
                  Your Wellness
                  <span className="block bg-gradient-to-r from-primaryblue to-primarygreen bg-clip-text text-transparent">
                    Matters
                  </span>
                </h1>

                <p className="text-gray-700 text-lg mb-8 leading-relaxed">
                  You’ve shown up today, and that’s already progress. Mental wellness is not about perfection—it’s about choosing yourself, every single day
                </p>
                <div className="w-full flex justify-center items-center p-4">
                  <img
                    src="/hea9.png"
                    alt="Descriptive Alt Text"
                    className="w-[300px] max-w-xl h-auto object-contain "
                  />
                </div>
              </div>




              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/10 to-transparent transform rotate-45 translate-x-16 -translate-y-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-400/20 to-transparent transform -rotate-12 -translate-x-8 translate-y-8"></div>
            </div>


            <div className="lg:w-1/2 bg-white/5 backdrop-blur-sm p-8 lg:p-12 flex flex-col  relative">


              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500 to-pink-500"></div>
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                  <defs>
                    <pattern id="grid" width="4" height="4" patternUnits="userSpaceOnUse">
                      <path d="M 4 0 L 0 0 0 4" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100" height="100" fill="url(#grid)" />
                </svg>
              </div>

              <div className="relative z-10 w-full flex-1 flex-col items-center justify-center">





                <div className="auth-page">

                  <div className="auth-container">
                    <div className="auth-card">
                      <div className="card-header">
                        <h2 className="card-title">Sign In</h2>
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
                            onKeyDown={handleKeyDown}
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
                            onKeyDown={handleKeyDown}
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

                      </div>
                    </div>
                  </div>
                </div>




                <div className="mb-4 text-center">
                  <p className="text-gray-700 text-xs">
                    By signing in, you agree to our
                    <a href="#" className="text-primaryblue hover:text-blue-800 ml-1">Terms of Service</a>
                  </p>
                </div>



                <div className="lg:ml-12 md:ml-8 bg-white rounded-lg p-4 max-w-sm w-full shadow-sm border">
                  <h3 className="text-sm text-center font-medium text-gray-700 mb-3">Select Role</h3>

                  <div className="flex items-center justify-center gap-4">
                    {roles.map((role) => (
                      <label key={role.id} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="role"
                          value={role.id}
                          checked={selectedRole === role.id}
                          onChange={() => handleRoleClick(role.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-800">{role.name}</span>
                      </label>
                    ))}
                  </div>
                </div>


              </div>
            </div>
          </div>
        </div>
      </div>




    </>
  );
};

export default StudentSignIn;