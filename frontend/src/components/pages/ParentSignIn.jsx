import React, { useState } from "react";

const ParentSignIn = () => {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const [otpTimer, setOtpTimer] = useState(30); // OTP resend timer (in seconds)

  const handleSendOtp = () => {
    if (phoneNumber.length === 10) {
      // Simulate sending OTP
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
      alert(`Welcome ${fullName}, Sign-In successful!`);
    } else {
      setOtpError(true);
      alert("Invalid OTP.");
    }
  };

  return (
    <div className="container">
      <h1>Parent Sign In</h1>
      <div className="gif-container">
        <img
          src="https://media.giphy.com/media/hvRJCLFzcasrR4ia7z/giphy.gif"
          alt="Welcome GIF"
          className="welcome-gif"
        />
      </div>

      <form onSubmit={handleSubmit} className="form-container">
        {/* Full Name Field */}
        {!otpSent && (
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              className="form-control"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>
        )}

        {/* Phone Number Field */}
        {!otpSent && (
          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              id="phoneNumber"
              type="tel"
              className="form-control"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter your phone number"
              maxLength={10}
              required
            />
            <button
              type="button"
              className="submit-button"
              onClick={handleSendOtp}
              disabled={phoneNumber.length !== 10 || !fullName}
            >
              Send OTP
            </button>
          </div>
        )}

        {/* OTP Field (visible after sending OTP) */}
        {otpSent && (
          <div className="form-group">
            <label htmlFor="otp">OTP</label>
            <input
              id="otp"
              type="text"
              className="form-control"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              maxLength={6}
              required
            />
            {otpError && <span className="error-text">Invalid OTP. Please try again.</span>}
          </div>
        )}

        {/* Password Field (visible after OTP is entered) */}
        {otpSent && (
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
        )}

        <button
          type="submit"
          className="submit-button"
          disabled={!otpSent || !otp || !password || otp.length !== 6}
        >
          Sign In
        </button>

        {/* Resend OTP Feature */}
        {otpSent && (
          <button
            type="button"
            className="submit-button resend-button"
            onClick={handleResendOtp}
            disabled={otpTimer > 0}
          >
            Resend OTP ({otpTimer}s)
          </button>
        )}
      </form>

      <div className="links">
        <a href="/parent-signup" className="link">
          Don't have an account? Sign Up
        </a>
      </div>
    </div>
  );
};

export default ParentSignIn;
