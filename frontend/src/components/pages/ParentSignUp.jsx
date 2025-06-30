import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./StudentSignIn.css";
import Toast from "./Toast";

const ParentSignUp = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [toast, setToast] = useState({ message: "", type: "info" });
  const [errorCount, setErrorCount] = useState(0);

  // Validation helpers
  const validatePhone = (num) => /^\d{10}$/.test(num);
  const validatePassword = (pw) => pw.length >= 6;

  const showErrorToast = (msg) => {
    setErrorCount((prev) => prev + 1);
    const suffix = errorCount >= 2 ? " If the issue persists, please contact the developer." : "";
    setToast({ message: msg + suffix, type: "error" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!name.trim() || !phone.trim() || !password.trim()) {
      showErrorToast("Please fill all fields.");
      setLoading(false);
      return;
    }
    if (!validatePhone(phone)) {
      showErrorToast("Please enter a valid 10-digit phone number.");
      setLoading(false);
      return;
    }
    if (!validatePassword(password)) {
      showErrorToast("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }
    if (!otpSent) {
      try {
        const response = await axios.post(`${import.meta.env.VITE_BASE_API_URL}/parent/send-otp`, { mobileNumber: phone });
        if (response.data.success) {
          setOtpSent(true);
          setOtpTimer(60);
          setToast({ message: "OTP sent to your phone!", type: "success" });
          const interval = setInterval(() => {
            setOtpTimer(prevTimer => {
              if (prevTimer <= 1) {
                clearInterval(interval);
                return 0;
              }
              return prevTimer - 1;
            });
          }, 1000);
        } else {
          setToast({ message: (response.data?.message || "Failed to send OTP.") + " If the issue persists, please contact the developer.", type: "error" });
        }
      } catch (error) {
        setToast({ message: (error.response?.data?.message || "Error sending OTP.") + " If the issue persists, please contact the developer.", type: "error" });
      } finally {
        setLoading(false);
      }
      return;
    }
    if (otp.length !== 6) {
      showErrorToast("Please enter a valid 6-digit OTP.");
      setLoading(false);
      return;
    }
    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_API_URL}/parent/register-parent`, {
        fullName: name,
        password,
        mobileNumber: phone,
        otp,
      });
      if (response.status === 201) {
        setToast({ message: "Parent Sign-up successful!", type: "success" });
        setTimeout(() => navigate("/parentDashboard"), 1200);
      } else {
        setToast({ message: (response.data?.message || "Registration failed.") + " If the issue persists, please contact the developer.", type: "error" });
      }
    } catch (error) {
      setToast({ message: (error.response?.data?.message || "Error during registration.") + " If the issue persists, please contact the developer.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (otpTimer > 0) return;
    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_API_URL}/parent/send-otp`, { mobileNumber: phone });
      if (response.data.success) {
        setOtpTimer(60);
        setToast({ message: "OTP resent!", type: "success" });
        const interval = setInterval(() => {
          setOtpTimer(prevTimer => {
            if (prevTimer <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prevTimer - 1;
          });
        }, 1000);
      } else {
        setToast({ message: (response.data?.message || "Failed to resend OTP.") + " If the issue persists, please contact the developer.", type: "error" });
      }
    } catch (error) {
      setToast({ message: (error.response?.data?.message || "Error resending OTP.") + " If the issue persists, please contact the developer.", type: "error" });
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
            <h2 className="card-title">Parent Sign Up</h2>
          </div>

          <form onSubmit={handleSubmit} className="form-container">
            <div className="form-group">
              <label htmlFor="name" className="form-label">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-input"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="form-input"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={10}
                required
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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

            {otpSent && (
              <div className="form-group">
                <label htmlFor="otp" className="form-label">OTP</label>
                <div className="otp-container">
                  <input
                    type="text"
                    id="otp"
                    name="otp"
                    className="form-input otp-input"
                    placeholder="Enter OTP sent to your phone"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    required
                  />
                  {otpTimer > 0 ? (
                    <div className="otp-timer">Resend in {otpTimer}s</div>
                  ) : (
                    <button 
                      type="button" 
                      onClick={resendOtp} 
                      className="secondary-button"
                      style={{ marginTop: 0, width: 'auto', padding: '0.5rem 1rem' }}
                    >
                      Resend
                    </button>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="primary-button parent-button"
              disabled={loading}
            >
              {loading ? "Processing..." : (otpSent ? "Complete Sign-Up" : "Send OTP")}
            </button>
          </form>

          <div className="auth-links">
            <p>
              Already have an account?{" "}
              <Link to="/parent-signin" className="auth-link parent">
                Sign in here
              </Link>
            </p>
            <p>
              Not a parent?{" "}
              <Link to="/role-selection" className="auth-link parent">
                Select your role
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentSignUp;