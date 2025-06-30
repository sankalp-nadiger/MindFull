import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./StudentSignIn.css";
import Toast from "./Toast";

const ParentSignIn = () => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpTimer, setOtpTimer] = useState(30);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "info" });
  const [errorCount, setErrorCount] = useState(0);

  // Validate phone number (10 digits, numeric)
  const validatePhone = (num) => /^\d{10}$/.test(num);

  const showErrorToast = (msg) => {
    setErrorCount((prev) => prev + 1);
    const suffix = errorCount >= 2 ? " If the issue persists, please contact the developer." : "";
    setToast({ message: msg + suffix, type: "error" });
  };

  const handleSendOtp = async () => {
    if (!validatePhone(phoneNumber)) {
      setOtpError("Please enter a valid 10-digit phone number.");
      showErrorToast("Please enter a valid 10-digit phone number.");
      return;
    }
    setIsSendingOtp(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_API_URL}/parent/send-otp`, {
        mobileNumber: phoneNumber,
      });
      if (response.data.success) {
        setOtpSent(true);
        setOtpError("");
        setToast({ message: "OTP sent to your phone!", type: "success" });
        startOtpTimer();
      }
    } catch (error) {
      setToast({ message: error.response?.data?.error || "Error sending OTP. Please try again.", type: "error" });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const startOtpTimer = () => {
    let timer = 30;
    setOtpTimer(timer);
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
    setOtpError("");
    if (!validatePhone(phoneNumber)) {
      setOtpError("Please enter a valid 10-digit phone number.");
      showErrorToast("Please enter a valid 10-digit phone number.");
      return;
    }
    if (otp.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP.");
      showErrorToast("Please enter a valid 6-digit OTP.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_API_URL}/parent/login`, {
        mobileNumber: phoneNumber,
        otp,
      });
      if (response.status === 200) {
        const { accessToken } = response.data.data;
        sessionStorage.setItem("accessToken", accessToken);
        setToast({ message: "Login successful!", type: "success" });
        setTimeout(() => navigate("/ParentDashboard"), 1200);
      }
    } catch (error) {
      setOtpError(error.response?.data?.message || "Error during login. Please try again.");
      setToast({ message: error.response?.data?.message || "Error during login. Please try again.", type: "error" });
    } finally {
      setIsSubmitting(false);
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
            <h2 className="card-title">Parent Sign In</h2>
            <p>Access your account to track progress</p>
          </div>
          <form onSubmit={handleSubmit} className="form-container">
            <div className="form-group">
              <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
              <input
                id="phoneNumber"
                type="tel"
                className={`form-input${otpError && !otpSent ? ' error' : ''}`}
                value={phoneNumber}
                onChange={(e) => { setPhoneNumber(e.target.value); setOtpError(""); }}
                placeholder="Enter your 10-digit phone number"
                maxLength={10}
                required
              />
              {otpError && !otpSent && <div className="error-message">{otpError}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="otp" className="form-label">OTP Verification</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input
                  id="otp"
                  type="text"
                  className={`form-input${otpError && otpSent ? ' error' : ''}`}
                  value={otp}
                  onChange={(e) => { setOtp(e.target.value); setOtpError(""); }}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  required
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="action-button parent-button"
                  onClick={handleSendOtp}
                  disabled={phoneNumber.length !== 10 || isSendingOtp}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {isSendingOtp ? "Sending..." : "Send OTP"}
                </button>
              </div>
              {otpError && otpSent && <div className="error-message">{otpError}</div>}
              {otpTimer > 0 && (
                <div className="otp-timer">Resend available in {otpTimer} seconds</div>
              )}
              <button
                type="button"
                className="secondary-button mt-2"
                onClick={handleResendOtp}
                disabled={otpTimer > 0}
              >
                Resend OTP {otpTimer > 0 ? `(${otpTimer}s)` : ''}
              </button>
            </div>
            <button
              type="submit"
              className="primary-button parent-button mt-4"
              disabled={!otp || otp.length !== 6 || phoneNumber.length !== 10 || isSubmitting}
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>
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
    </div>
  );
};

export default ParentSignIn;