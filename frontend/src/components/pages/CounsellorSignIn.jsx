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
        const response = await axios.post("http://localhost:8000/api/counsellor/send-otp", {
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
      const response = await axios.post("http://localhost:8000/api/counsellor/login-counsellor", {
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-black via-blue-950 to-black text-white px-6">
      <h1 className="text-4xl font-bold text-indigo-400 mb-6">Counselor Sign In</h1>
      <div className="w-full max-w-md p-6 bg-gray-900 shadow-lg rounded-lg flex flex-col items-center">
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {!otpSent && (
            <>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-300">Email</label>
                <input
                  type="email"
                  className="mt-1 p-2 w-full bg-gray-800 text-white border border-gray-700 rounded-md"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-300">Phone Number</label>
                <input
                  type="tel"
                  className="mt-1 p-2 w-full bg-gray-800 text-white border border-gray-700 rounded-md"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter your phone number"
                  maxLength={10}
                  required
                />
                <button
                  type="button"
                  className="mt-3 px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
                  onClick={handleSendOtp}
                  disabled={phoneNumber.length !== 10 || !email}
                >
                  Send OTP
                </button>
              </div>
            </>
          )}
          {otpSent && (
            <>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-300">OTP</label>
                <input
                  type="text"
                  className="mt-1 p-2 w-full bg-gray-800 text-white border border-gray-700 rounded-md"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  maxLength={6}
                  required
                />
                {otpError && <span className="text-red-500 text-sm">Invalid OTP. Please try again.</span>}
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-300">Password</label>
                <input
                  type="password"
                  className="mt-1 p-2 w-full bg-gray-800 text-white border border-gray-700 rounded-md"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                disabled={!otpSent || !otp || !password || otp.length !== 6}
              >
                Sign In
              </button>
              <button
                type="button"
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
                onClick={handleResendOtp}
                disabled={otpTimer > 0}
              >
                Resend OTP ({otpTimer}s)
              </button>
            </>
          )}
        </form>
        <div className="mt-4">
          <a href="/counsellor-signup" className="text-indigo-400 hover:underline">
            Don't have an account? Sign Up
          </a>
        </div>
      </div>
    </div>
  );
};

export default CounselorSignIn;
