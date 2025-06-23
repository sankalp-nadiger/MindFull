import React, { useState } from "react";
import { Mail, Phone, ArrowLeft, Send, RefreshCw } from "lucide-react";
import "./StudentSignIn.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const CounselorSignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpTimer, setOtpTimer] = useState(30);
  const [loginMethod, setLoginMethod] = useState(null);
  const [inputChanged, setInputChanged] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Reset all state when login method changes
  const handleLoginMethodChange = (method) => {
    setLoginMethod(method);
    setEmail("");
    setPhoneNumber("");
    setOtp("");
    setOtpSent(false);
    setOtpError("");
    setOtpTimer(30);
    setInputChanged(false);
  };

  // Reset code/otp state if input changes
  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    setOtp("");
    setOtpSent(false);
    setOtpError("");
    setOtpTimer(30);
    setInputChanged(true);
  };

  const handleSendOtpOrCode = async () => {
    setOtpError("");
    setIsLoading(true);
    
    if (loginMethod === "sms") {
      if (phoneNumber.length === 10) {
        try {
          const response = await axios.post(`${import.meta.env.VITE_BASE_API_URL}/counsellor/send-otp`, {
            mobileNumber: phoneNumber,
          });
          if (response.data.success) {
          setOtpSent(true);
          setInputChanged(false);
          startOtpTimer();
        } }catch (error) {
          setOtpError("Error sending OTP. Please try again.");
        }
      } else {
        setOtpError("Please enter a valid 10-digit phone number.");
      }
    } else if (loginMethod === "email") {
      if (email && email.includes("@")) {
        console.log("Sending email code to:", email);
        try {
          const response = await axios.post(`${import.meta.env.VITE_BASE_API_URL}/counsellor/send-email-code`, {
            email: email,
          });
          if (response.data.success) {
          setOtpSent(true);
          setInputChanged(false);
          startOtpTimer();
        } }catch (error) {
          setOtpError("Error sending code. Please try again.");
        }
      } else {
        setOtpError("Please enter a valid email address.");
      }
    }
    
    setIsLoading(false);
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
      handleSendOtpOrCode();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setOtpError("");
    setIsLoading(true);
    
    if (otp.length !== 6) {
      setOtpError(`Please enter the 6-digit ${loginMethod === "sms" ? "OTP" : "code"}.`);
      setIsLoading(false);
      return;
    }
    
    if (loginMethod === "sms") {
     
      try {
        const response = await axios.post(`${import.meta.env.VITE_BASE_API_URL}/counsellor/login-counsellor`, {
          mobileNumber: phoneNumber,
          otp,
        });
        if (response.status === 200) {
          const { accessToken } = response.data.data;
          sessionStorage.setItem("accessToken", accessToken);
          alert("Sign In successful!");
          navigate("/councellor");
        }
      } catch (error) {
        setOtpError(error.response?.data?.message || "Error during login.");
      }
    } else if (loginMethod === "email") {
     
      try {
        const response = await axios.post(`${import.meta.env.VITE_BASE_API_URL}/counsellor/login-counsellor`, {
          email,
          code: otp,
        });
        if (response.status === 200) {
          const { accessToken } = response.data.data;
          sessionStorage.setItem("accessToken", accessToken);
          alert("Sign In successful!");
          navigate("/councellor");
        }
      } catch (error) {
        setOtpError(error.response?.data?.message || "Error during login.");
      }
    
    }
    
    setIsLoading(false);
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
          {/* Header */}
          <div className="card-header">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="32" height="32" className="text-gray-600">
                <path d="M20,5 C22.5,12.5 25,20 25,25 C25,20 27.5,12.5 30,5" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" />
                <path d="M20,35 C17.5,27.5 15,20 10,17.5 C15,15 17.5,7.5 20,5" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" />
                <path d="M20,35 C22.5,27.5 25,20 30,17.5 C25,15 22.5,7.5 20,5" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your counselor dashboard</p>
          </div>

          <div className="p-8">
            {/* Login Method Selection */}
            {!loginMethod && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 text-center mb-6">
                  Choose your sign-in method
                </h3>
                
                <div className="text-left space-y-4">
                  <button
                    type="button"
                    onClick={() => handleLoginMethodChange("email")}
                    className="w-full flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 group text-left"
                  >
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Continue with Email</div>
                      <div className="text-sm text-gray-500">Get a verification code via email</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLoginMethodChange("sms")}
                    className="w-full flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 group text-left"
                  >
                    <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Continue with Phone</div>
                      <div className="text-sm text-gray-500">Get an OTP via SMS</div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Login Form */}
            {loginMethod && (
              <div className="space-y-6">
                {/* Back Button */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => handleLoginMethodChange(null)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors mx-auto"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm">Change method</span>
                  </button>
                </div>

                {/* Email Input */}
                {loginMethod === "email" && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                        value={email}
                        onChange={handleInputChange(setEmail)}
                        placeholder="Enter your email address"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Phone Input */}
                {loginMethod === "sms" && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                        value={phoneNumber}
                        onChange={handleInputChange(setPhoneNumber)}
                        placeholder="Enter 10-digit phone number"
                        maxLength={10}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* OTP/Code Input */}
                {otpSent && (
                  <div className="space-y-2 text-center">
                    <label className="block text-sm font-medium text-gray-700">
                      {loginMethod === "sms" ? "Enter OTP" : "Enter Verification Code"}
                    </label>
                    <input
                      type="text"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-center text-lg font-mono text-gray-700 bg-white ${
                        otpError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      value={otp}
                      onChange={(e) => { 
                        setOtp(e.target.value.replace(/\D/g, '')); 
                        setOtpError(""); 
                      }}
                      placeholder="000000"
                      maxLength={6}
                      required
                    />
                    {otpError && (
                      <p className="text-sm text-red-600 flex items-center justify-center gap-1">
                        <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                        {otpError}
                      </p>
                    )}
                    
                    {/* Timer and Resend */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        Code sent to {loginMethod === "sms" ? `•••••${phoneNumber.slice(-4)}` : `•••@${email.split('@')[1]}`}
                      </span>
                      {otpTimer > 0 ? (
                        <span className="text-blue-600 font-medium">Resend in {otpTimer}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Resend Code
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3 text-center">
                  {!otpSent || inputChanged ? (
                    <button
                      type="button"
                      onClick={handleSendOtpOrCode}
                      disabled={isLoading || (loginMethod === "sms" ? phoneNumber.length !== 10 : !email)}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send {loginMethod === "sms" ? "OTP" : "Code"}
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="submit"
                      onClick={handleSubmit}
                      disabled={isLoading || !otp || otp.length !== 6}
                      className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Signing In...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Footer Links */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center space-y-2">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <a href="/counsellor-signup" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign Up
                </a>
              </p>
              <p className="text-sm">
                <a href="/" className="text-gray-500 hover:text-gray-700">
                  ← Back to Home Page
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