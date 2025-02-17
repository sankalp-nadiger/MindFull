import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ParentSignIn = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const [otpTimer, setOtpTimer] = useState(30);
  const [showPassword, setShowPassword] = useState(false); // State for password visibility

  const handleSendOtp = async () => {
    if (phoneNumber.length === 10) {
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
        alert("Error sending OTP: " + error.response.data.error);
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
      const response = await axios.post(`${import.meta.env.VITE_BASE_API_URL}/parent/login`, {
        fullName,
        mobileNumber: phoneNumber,
        otp,
        password,
      });
      console.log(response.data);
      if (response.status === 200) {
        const { accessToken } = response.data.data;
        sessionStorage.setItem("accessToken", accessToken);
        alert("Login successful!");
        navigate("/ParentDashboard");
      }
    } catch (error) {
      setOtpError(true);
      alert("Error during login: " + error.response.data.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-black via-blue-950 to-black text-white px-6">
      <h1 className="text-4xl font-bold text-yellow-600 mb-6">Parent SignIn</h1>

      <div className="w-full max-w-md p-6 bg-gray-900 shadow-lg rounded-lg flex flex-col items-center">
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {!otpSent && (
            <div className="flex flex-col">
              <label htmlFor="fullName" className="text-sm font-medium text-gray-300">Full Name</label>
              <input
                id="fullName"
                type="text"
                className="mt-1 p-2 w-full bg-gray-800 text-white border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
          )}

          {!otpSent && (
            <div className="flex flex-col">
              <label htmlFor="phoneNumber" className="text-sm font-medium text-gray-300">Phone Number</label>
              <input
                id="phoneNumber"
                type="tel"
                className="mt-1 p-2 w-full bg-gray-800 text-white border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your phone number"
                maxLength={10}
                required
              />
              <button
                type="button"
                className="mt-3 px-4 py-2 font-semibold bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-all disabled:opacity-50"
                onClick={handleSendOtp}
                disabled={phoneNumber.length !== 10 || !fullName}
              >
                Send OTP
              </button>
            </div>
          )}

          {otpSent && (
            <div className="flex flex-col">
              <label htmlFor="otp" className="text-sm font-medium text-gray-300">OTP</label>
              <input
                id="otp"
                type="text"
                className="mt-1 p-2 w-full bg-gray-800 text-white border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                maxLength={6}
                required
              />
              {otpError && <span className="text-red-500 text-sm">Invalid OTP. Please try again.</span>}
            </div>
          )}

          {otpSent && (
            <div className="flex flex-col">
              <label htmlFor="password" className="text-sm font-medium text-gray-300">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="mt-1 p-2 w-full bg-gray-800 text-white border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full px-4 py-2 font-semibold bg-green-500 text-white rounded-md hover:bg-green-600 transition-all disabled:opacity-50"
            disabled={!otpSent || !otp || !password || otp.length !== 6}
          >
            Sign In
          </button>

          {otpSent && (
            <button
              type="button"
              className="w-full px-4 py-2 font-semibold bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-all disabled:opacity-50"
              onClick={handleResendOtp}
              disabled={otpTimer > 0}
            >
              Resend OTP ({otpTimer}s)
            </button>
          )}
        </form>

        <div className="mt-4">
          <a href="/parent-signup" className="text-indigo-400 hover:underline">
            Don't have an account? Sign Up
          </a>
        </div>
      </div>
    </div>
  );
};

export default ParentSignIn;
