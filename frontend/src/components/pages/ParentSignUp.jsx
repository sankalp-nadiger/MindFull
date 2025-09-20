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
    <>
    <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "info" })} />
     
     <div className="min-h-screen font-poppins bg-gradient-to-b from-green-400 via-green-200 to-blue-300  flex items-center justify-center p-4 ">
      

      {/* Main container */}
      <div className="relative w-full max-w-6xl bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden ">
        <div className="flex flex-col lg:flex-row min-h-[600px] sm:min-h-[300px] ">
          
          {/* Left Panel - Welcome Section */}
          <div className="lg:w-1/2 bg-[#f2f8fc] p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
            
            {/* Decorative floating elements */}
            <div className="absolute top-10 right-10 w-20 h-20 bg-green-600/50 rounded-full animate-bounce delay-300"></div>
            
            <div className="absolute top-1/3 left-1/4 w-12 h-12 bg-blue-400/40 rounded-full animate-pulse"></div>
            
            
            {/* Logo and branding */}
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
                Welcome <span className=" bg-gradient-to-r from-primaryblue to-primarygreen bg-clip-text text-transparent">
                   aboard !
                </span>
              </h1>
              
              <p className="text-gray-700 text-lg mb-8 leading-relaxed">
                You’ve shown up today, and that’s already progress. Mental wellness is not about perfection—it’s about choosing yourself, every single day
              </p>
              <div className="w-full flex justify-center items-center p-4">
      <img
        src="/hea10.png" // replace with your image path
        alt="Descriptive Alt Text"
        className="w-[300px] sm:w-[400px] max-w-4xl h-[400px]  object-contain "
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

export default ParentSignUp;