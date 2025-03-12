import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CounselorSignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const [otpTimer, setOtpTimer] = useState(30);

  const handleSendOtp = async () => {
    if (phoneNumber.length === 10 && email) {
      try {
        const response = await axios.post(`${import.meta.env.VITE_BASE_API_URL}/counsellor/send-otp`, {
          mobileNumber: phoneNumber,
          email: email,
        });

        if (response.data.success) {
          setOtpSent(true);
          setOtpError(false);
          alert("OTP sent to your phone!");
          startOtpTimer();
        }
      } catch (error) {
        alert("Error sending OTP: " + error.response?.data?.message || error.message);
      }
    } else {
      alert("Please enter a valid phone number and email.");
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
    } else {
      alert(`You can resend OTP after ${otpTimer} seconds.`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      setOtpError(true);
      alert("Invalid OTP.");
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_API_URL}/counsellor/login-counsellor`, {
        mobileNumber: phoneNumber,
        otp,
        email,
        password,
      });
      if (response.status === 200) {
        const { accessToken } = response.data.data;
        sessionStorage.setItem("accessToken", accessToken);
        alert("Sign In successful!");
        navigate("/councellor");
      }

    } catch (error) {
      setOtpError(true);
      alert("Error during login: " + error.response?.data?.message || error.message);
    }
  };

  const navigateHome = () => {
    navigate("/");
  };

  return (
    <div className="auth-page">
    <div className="auth-container">
      <h1 className="app-title">Counselor Sign In</h1>
      <div className="auth-card">
        <div className="card-header">
          <div className="welcome-animation">
            {/* Namaste Icon SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
              <circle cx="40" cy="40" r="40" fill="#6157ff" opacity="0.1" />
              <g transform="translate(20, 15)">
                <path d="M20,0 C25,10 30,20 30,30 C30,20 35,10 40,0" 
                      fill="none" 
                      stroke="#6157ff" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" />
                <path d="M20,50 C15,40 10,30 0,25 C10,20 15,10 20,0" 
                      fill="none" 
                      stroke="#6157ff" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" />
                <path d="M20,50 C25,40 30,30 40,25 C30,20 25,10 20,0" 
                      fill="none" 
                      stroke="#6157ff" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" />
                <animateTransform 
                  attributeName="transform"
                  type="scale"
                  from="0.95"
                  to="1.05"
                  begin="0s"
                  dur="2s"
                  repeatCount="indefinite"
                  additive="sum"
                />
              </g>
            </svg>
          </div>
          <h2 className="card-title">Welcome Back</h2>
          <p>Please log in to access your counselor dashboard</p>
        </div>
        
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            {!otpSent ? (
              <>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter your phone number"
                    maxLength={10}
                    required
                  />
                </div>
                
                <button
                  type="button"
                  className="primary-button"
                  onClick={handleSendOtp}
                  disabled={phoneNumber.length !== 10 || !email}
                >
                  Send OTP
                </button>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">OTP</label>
                  <div className="otp-container">
                    <input
                      type="text"
                      className={`form-input otp-input ${otpError ? 'error' : ''}`}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter OTP"
                      maxLength={6}
                      required
                    />
                  </div>
                  {otpError && <div className="error-message">Invalid OTP. Please try again.</div>}
                  <div className="otp-timer">
                    Resend OTP in {otpTimer} seconds
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="primary-button"
                  disabled={!otpSent || !otp || !password || otp.length !== 6}
                >
                  Sign In
                </button>
                
                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleResendOtp}
                  disabled={otpTimer > 0}
                >
                  Resend OTP
                </button>
              </>
            )}
          </form>
          
          <div className="auth-links">
            <p>
              Don't have an account? <a href="/counsellor-signup" className="auth-link">Sign Up</a>
            </p>
            <p>
              <a href="/" className="auth-link" onClick={(e) => { e.preventDefault(); navigateHome(); }}>
                Back to Home Page
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default CounselorSignIn;