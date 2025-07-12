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
    <>
     <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "info" })} />
      
    <div className="min-h-screen font-poppins bg-gradient-to-b from-primarygreen via-[#1fa313] to-primaryblue flex items-center justify-center p-4 ">
      {/* Animated background elements */}
     
        <div className="absolute -top-40 -right-40 w-80 h-80  rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-pulse delay-500"></div>
      

      {/* Main container */}
      <div className="relative w-full max-w-6xl bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden ">
        <div className="flex flex-col-reverse lg:flex-row min-h-[600px] ">
          
          {/* Left Panel - Welcome Section */}
          <div className="lg:w-1/2 bg-white p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
            
            {/* Decorative floating elements */}
            <div className="absolute top-10 right-10 w-20 h-20 bg-green-600/50 rounded-full animate-bounce delay-300"></div>
            
            
            
            {/* Logo and branding */}
            <div className="relative z-10">
              <div className="flex items-center mb-8">
                <div className="w-16 h-12 bg-green/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                  <div className="w-20 h-6 border-2 border-white rounded-full flex items-center justify-center">
                    <img
                src="/plant.png"
                className="w-auto lg:h-16 h-10"
                alt="Logo"
              />
                  </div>
                </div>
                <span className="ml-3 text-green-900 text-3xl font-bold tracking-wide">MindFull</span>
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
        src="/hea9.png" // replace with your image path
        alt="Descriptive Alt Text"
        className="w-full max-w-4xl h-auto object-contain "
      />
    </div>
            </div>

            

            {/* Geometric decorations */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/10 to-transparent transform rotate-45 translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-400/20 to-transparent transform -rotate-12 -translate-x-8 translate-y-8"></div>
          </div>

          {/* Right Panel - Form Section */}
          <div className="lg:w-1/2 bg-white/5 backdrop-blur-sm p-8 lg:p-12 flex flex-col  relative">
            
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500 to-pink-500"></div>
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                <defs>
                  <pattern id="grid" width="4" height="4" patternUnits="userSpaceOnUse">
                    <path d="M 4 0 L 0 0 0 4" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#grid)" />
              </svg>
            </div>

            <div className="relative z-10 w-full  "></div>


    
    <div className="auth-page">
     
      <div className="auth-container">
      
        <div className="auth-card">
          <div className="card-header">
            <h2 className="card-title">Parent Sign In</h2>
            <p className="text-gray-700">Access your account to track progress</p>
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
              <Link to="/signin" className="auth-link parent">
                Return to role selection
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

    </div>
            </div>
          </div>
        </div>
    </>
  

  );
};

export default ParentSignIn;