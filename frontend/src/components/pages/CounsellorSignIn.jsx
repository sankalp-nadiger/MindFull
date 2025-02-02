import React, { useState } from "react";
//import "./CounselorSignIn.css";

const CounselorSignIn = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const [otpTimer, setOtpTimer] = useState(30); // OTP resend timer (in seconds)

  const handleSendOtp = () => {
    if (phoneNumber.length === 10) {
      setOtpSent(true);
      setOtpError(false);
      alert("OTP sent to your phone!");
      startOtpTimer();
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
      setOtpTimer(30); // Reset timer if resend is available
      handleSendOtp();
    } else {
      alert(`You can resend OTP after ${otpTimer} seconds.`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (otp.length === 6 && otp === "123456") {
      alert("Sign In successful!");
    } else {
      setOtpError(true);
      alert("Invalid OTP.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-black via-blue-950 to-black text-white px-6">
  <h1 className="text-4xl font-bold text-indigo-400 mb-6">Counselor Sign In</h1>

  <div className="w-full max-w-md p-6 bg-gray-900 shadow-lg rounded-lg flex flex-col items-center">
    <div className="mb-4">
      <img
        src="https://media.giphy.com/media/hvRJCLFzcasrR4ia7z/giphy.gif"
        alt="Welcome GIF"
        className="w-20 h-20"
      />
    </div>

    <form onSubmit={handleSubmit} className="w-full space-y-4">
      {/* Phone Number Field */}
      {!otpSent && (
        <div className="flex flex-col">
          <label htmlFor="phoneNumber" className="text-sm font-medium text-gray-300">Phone Number</label>
          <input
            id="phoneNumber"
            type="tel"
            className="mt-1 p-2 w-full bg-gray-800 text-white border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="Enter your phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            maxLength={10}
            required
          />
          <button
            type="button"
            className="w-full mt-2 px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-all disabled:opacity-50"
            onClick={handleSendOtp}
            disabled={phoneNumber.length !== 10}
          >
            Send OTP
          </button>
        </div>
      )}

      {/* OTP Field */}
      {otpSent && (
        <div className="flex flex-col">
          <label htmlFor="otp" className="text-sm font-medium text-gray-300">OTP</label>
          <input
            id="otp"
            type="text"
            className="mt-1 p-2 w-full bg-gray-800 text-white border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            required
          />
          {otpError && <span className="text-red-500 text-sm mt-1">Invalid OTP. Please try again.</span>}
        </div>
      )}

      {/* Email & Password Fields */}
      {otpSent && (
        <>
          <div className="flex flex-col">
            <label htmlFor="email" className="text-sm font-medium text-gray-300">Email</label>
            <input
              id="email"
              type="email"
              className="mt-1 p-2 w-full bg-gray-800 text-white border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="password" className="text-sm font-medium text-gray-300">Password</label>
            <input
              id="password"
              type="password"
              className="mt-1 p-2 w-full bg-gray-800 text-white border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </>
      )}

      <button
        type="submit"
        className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-all disabled:opacity-50"
        disabled={!otpSent || !otp || !email || !password}
      >
        Sign In
      </button>

      {/* Resend OTP Feature */}
      {otpSent && (
        <button
          type="button"
          className="w-full px-4 py-2 bg-yellow-500 text-black rounded-md hover:bg-yellow-600 transition-all disabled:opacity-50"
          onClick={handleResendOtp}
          disabled={otpTimer > 0}
        >
          Resend OTP ({otpTimer}s)
        </button>
      )}
    </form>

    <div className="flex flex-col items-center mt-4">
      <a href="/forgot-password" className="text-sm text-gray-400 hover:text-white transition-all">
        Forgot Password?
      </a>
      <div className="mt-2">
        <p className="text-sm text-gray-400">Don't have an account?</p>
        <a href="/counsellor-signup" className="text-indigo-400 hover:underline transition-all">
          Sign Up
        </a>
      </div>
    </div>
  </div>
</div>

  );
};

export default CounselorSignIn;
