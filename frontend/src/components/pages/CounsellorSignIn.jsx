import React, { useState } from "react";
import { Mail, Phone, ArrowLeft, Send, RefreshCw } from "lucide-react";
import "./StudentSignIn.css";
import axios from "axios";
import Toast from "./Toast";
import { Link, useNavigate } from "react-router-dom";
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
  const [toast, setToast] = useState({ message: "", type: "info" });
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

  // Email/phone validation
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (num) => /^\d{10}$/.test(num);

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

  const showErrorToast = (msg) => {
    setErrorCount((prev) => prev + 1);
    const suffix = errorCount >= 2 ? " If the issue persists, please contact the developer." : "";
    setToast({ message: msg + suffix, type: "error" });
  };

  const handleSendOtpOrCode = async () => {
    setOtpError("");
    setIsLoading(true);
    if (loginMethod === "sms") {
      if (!validatePhone(phoneNumber)) {
        setOtpError("Please enter a valid 10-digit phone number.");
        showErrorToast("Please enter a valid 10-digit phone number.");
        setIsLoading(false);
        return;
      }
      try {
        const response = await axios.post(`${import.meta.env.VITE_BASE_API_URL}/counsellor/send-otp`, {
          mobileNumber: phoneNumber,
        });
        if (response.data.success) {
          setOtpSent(true);
          setInputChanged(false);
          setToast({ message: "OTP sent to your phone!", type: "success" });
          startOtpTimer();
        }
      } catch (error) {
        setOtpError(error.response?.data?.message || "Error sending OTP. Please try again.");
        showErrorToast(error.response?.data?.message || "Error sending OTP. Please try again.");
      }
    } else if (loginMethod === "email") {
      if (!validateEmail(email)) {
        setOtpError("Please enter a valid email address.");
        showErrorToast("Please enter a valid email address.");
        setIsLoading(false);
        return;
      }
      try {
        const response = await axios.post(`${import.meta.env.VITE_BASE_API_URL}/counsellor/send-email-code`, {
          email: email,
        });
        if (response.data.success) {
          setOtpSent(true);
          setInputChanged(false);
          setToast({ message: "Code sent to your email!", type: "success" });
          startOtpTimer();
        }
      } catch (error) {
        setOtpError(error.response?.data?.message || "Error sending code. Please try again.");
        showErrorToast(error.response?.data?.message || "Error sending code. Please try again.");
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
    if (loginMethod === "sms") {
      if (!validatePhone(phoneNumber)) {
        setOtpError("Please enter a valid 10-digit phone number.");
        showErrorToast("Please enter a valid 10-digit phone number.");
        setIsLoading(false);
        return;
      }
      if (otp.length !== 6) {
        setOtpError("Please enter the 6-digit OTP.");
        showErrorToast("Please enter the 6-digit OTP.");
        setIsLoading(false);
        return;
      }
      try {
        const response = await axios.post(`${import.meta.env.VITE_BASE_API_URL}/counsellor/login-counsellor`, {
          mobileNumber: phoneNumber,
          otp,
        });
        if (response.status === 200) {
          const { accessToken } = response.data.data;
          sessionStorage.setItem("accessToken", accessToken);
          setToast({ message: "Login successful!", type: "success" });
          setTimeout(() => navigate("/councellor"), 1200);
        }
      } catch (error) {
        setOtpError(error.response?.data?.message || "Error during login. Please try again.");
        showErrorToast(error.response?.data?.message || "Error during login. Please try again.");
      }
    } else if (loginMethod === "email") {
      if (!validateEmail(email)) {
        setOtpError("Please enter a valid email address.");
        showErrorToast("Please enter a valid email address.");
        setIsLoading(false);
        return;
      }
      if (otp.length !== 6) {
        setOtpError("Please enter the 6-digit code.");
        showErrorToast("Please enter the 6-digit code.");
        setIsLoading(false);
        return;
      }
      try {
        const response = await axios.post(`${import.meta.env.VITE_BASE_API_URL}/counsellor/login-counsellor`, {
          email,
          code: otp,
        });
        if (response.status === 200) {
          const { accessToken } = response.data.data;
          sessionStorage.setItem("accessToken", accessToken);
          setToast({ message: "Login successful!", type: "success" });
          setTimeout(() => navigate("/councellor"), 1200);
        }
      } catch (error) {
        setOtpError(error.response?.data?.message || "Error during login. Please try again.");
        showErrorToast(error.response?.data?.message || "Error during login. Please try again.");
      }
    }
    setIsLoading(false);
  };

  return (
    <>
<div className="min-h-screen font-poppins bg-gradient-to-b from-green-400 via-green-200 to-blue-300  flex items-center justify-center p-4 ">
     
     

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
        src="/hea9.png" // replace with your image path
        alt="Descriptive Alt Text"
        className="w-[300px] max-w-4xl h-auto object-contain "
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
                    {otpError && <p className="text-sm text-red-600">{otpError}</p>}
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
                    {otpError && <p className="text-sm text-red-600">{otpError}</p>}
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
             <p>
                                       
                                       <Link to="/signin" className="auth-link text-primaryblue">
                                         Return to role selection
                                       </Link>
                                     </p>
            </div>
          </div>
        </div>
      </div>
      <Toast message={toast.message} type={toast.type} />
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

export default CounselorSignIn;