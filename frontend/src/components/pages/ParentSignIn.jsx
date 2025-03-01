import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./StudentSignIn.css";
const ParentSignIn = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const [otpTimer, setOtpTimer] = useState(30);
  const [showPassword, setShowPassword] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendOtp = async () => {
    if (phoneNumber.length === 10) {
      setIsSendingOtp(true);
      try {
        const response = await axios.post(`${import.meta.env.VITE_BASE_API_URL}/parent/send-otp`, {
          mobileNumber: phoneNumber,
        });
        if (response.data.success) {
          setOtpSent(true);
          setOtpError(false);
          alert("OTP sent to your phone!");
          startOtpTimer();
        }
      } catch (error) {
        alert("Error sending OTP: " + error.response?.data?.error || "Please try again");
      } finally {
        setIsSendingOtp(false);
      }
    } else {
      alert("Please enter a valid phone number.");
    }
  };

  const startOtpTimer = () => {
    let timer = 30;
    const intervalId = setInterval(() => {
      timer -= 1;
      setOtpTimer(timer);
      if (timer === 0) {
        clearInterval(intervalId);
      }
    }, 1000);
  };

  const handleResendOtp = () => {
    if (otpTimer === 0) {
      setOtpTimer(30);
      handleSendOtp();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      setOtpError(true);
      alert("Please enter a valid 6-digit OTP.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_API_URL}/parent/login`, {
        fullName,
        mobileNumber: phoneNumber,
        otp,
        password,
      });
      
      if (response.status === 200) {
        const { accessToken } = response.data.data;
        sessionStorage.setItem("accessToken", accessToken);
        alert("Login successful!");
        navigate("/ParentDashboard");
      }
    } catch (error) {
      setOtpError(true);
      alert("Error during login: " + (error.response?.data?.message || "Please try again"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <h1 className="app-title parent">MindFull</h1>

      <div className="auth-card">
        <div className="card-header">
          <h2 className="card-title">Parent Sign In</h2>
          <p>Access your account to track progress</p>
        </div>

        <form onSubmit={handleSubmit} className="form-container">
          {!otpSent && (
            <div className="form-group">
              <label htmlFor="fullName" className="form-label">Full Name</label>
              <input
                id="fullName"
                type="text"
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
          )}

          {!otpSent && (
            <div className="form-group">
              <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
              <input
                id="phoneNumber"
                type="tel"
                className="form-input"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your 10-digit phone number"
                maxLength={10}
                required
              />
              <button
                type="button"
                className="action-button parent-button mt-3"
                onClick={handleSendOtp}
                disabled={phoneNumber.length !== 10 || !fullName || isSendingOtp}
              >
                {isSendingOtp ? "Sending..." : "Send OTP"}
              </button>
            </div>
          )}

          {otpSent && (
            <div className="form-group">
              <label htmlFor="otp" className="form-label">OTP Verification</label>
              <input
                id="otp"
                type="text"
                className={`form-input ${otpError ? 'error' : ''}`}
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value);
                  if (otpError) setOtpError(false);
                }}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                required
              />
              {otpError && (
                <div className="error-message">Invalid OTP. Please try again.</div>
              )}
              {otpTimer > 0 && (
                <div className="otp-timer">Resend available in {otpTimer} seconds</div>
              )}
            </div>
          )}

          {otpSent && (
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="input-with-button">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="input-button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
          )}

          {otpSent && (
            <button
              type="submit"
              className="primary-button parent-button"
              disabled={!otp || !password || otp.length !== 6 || isSubmitting}
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>
          )}

          {otpSent && (
            <button
              type="button"
              className="secondary-button"
              onClick={handleResendOtp}
              disabled={otpTimer > 0}
            >
              Resend OTP {otpTimer > 0 ? `(${otpTimer}s)` : ''}
            </button>
          )}
        </form>

        <div className="auth-links">
          <p>
            <Link to="/parent-signup" className="auth-link parent">
              Don't have an account? Sign Up
            </Link>
          </p>
          <p>
            <Link to="/role-selection" className="auth-link parent">
              Return to role selection
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ParentSignIn;