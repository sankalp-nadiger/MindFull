import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ParentSignUp = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for password visibility

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otpSent) {
      try {
        const response = await axios.post(`${import.meta.env.VITE_BASE_API_URL}/parent/send-otp`, { mobileNumber: phone });
        if (response.data.success) {
          setOtpSent(true);
          alert("OTP sent to your phone.");
        } else {
          alert("Failed to send OTP. Please try again.");
        }
      } catch (error) {
        alert("Error sending OTP: " + error.message);
      }
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
        alert("Parent Sign-up successful!");
        navigate("/parentDashboard");
      } else {
        alert("Registration failed: " + response.data.message);
      }
    } catch (error) {
      alert("Error during registration: " + error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-black via-blue-950 to-black text-white px-6">
      <h1 className="text-4xl font-bold text-indigo-400 mb-6">Parent Sign Up</h1>

      <div className="w-full max-w-md p-6 bg-gray-900 shadow-lg rounded-lg flex flex-col items-center">
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="flex flex-col">
            <label htmlFor="name" className="text-sm font-medium text-gray-300">Full Name</label>
            <input
              type="text"
              id="name"
              className="mt-1 p-2 w-full bg-gray-800 text-white border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="password" className="text-sm font-medium text-gray-300">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="mt-1 p-2 w-full bg-gray-800 text-white border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          <div className="flex flex-col">
            <label htmlFor="phone" className="text-sm font-medium text-gray-300">Phone Number</label>
            <input
              type="tel"
              id="phone"
              className="mt-1 p-2 w-full bg-gray-800 text-white border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={10}
              required
            />
          </div>

          {otpSent && (
            <div className="flex flex-col">
              <label htmlFor="otp" className="text-sm font-medium text-gray-300">OTP</label>
              <input
                type="text"
                id="otp"
                className="mt-1 p-2 w-full bg-gray-800 text-white border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Enter OTP sent to your phone"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full px-4 py-2 font-semibold bg-green-500 text-white rounded-md hover:bg-green-600 transition-all disabled:opacity-50"
          >
            {otpSent ? "Complete Sign-Up" : "Send OTP"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ParentSignUp;
