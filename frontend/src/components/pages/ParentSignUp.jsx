import React, { useState } from "react";
import axios from "axios"; // Import axios for making HTTP requests
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

const ParentSignUp = () => {
  const navigate = useNavigate(); // Initialize the navigate function

  const [name, setName] = useState(""); // State for full name
  const [phone, setPhone] = useState(""); // State for phone number
  const [password, setPassword] = useState(""); // State for password
  const [otp, setOtp] = useState(""); // State for OTP
  const [otpSent, setOtpSent] = useState(false); // Track if OTP is sent

  const handleSubmit = async (e) => {
    e.preventDefault();

    // If OTP is not sent yet, send the OTP first
    if (!otpSent) {
      try {
        // Send phone number to backend to generate and send OTP
        const response = await axios.post("http://localhost:8000/api/parent/send-otp", { mobileNumber: phone });
        if (response.data.success) {
          setOtpSent(true); // Set OTP sent flag to true
          alert("OTP sent to your phone.");
        } else {
          alert("Failed to send OTP. Please try again.");
        }
      } catch (error) {
        alert("Error sending OTP: " + error.message);
      }
      return;
    }

    // If OTP is already sent, proceed with registration
    try {
      const response = await axios.post("http://localhost:8000/api/parent/register-parent", {
        fullName: name,
        password,
        mobileNumber: phone,
        otp,
      });

      if (response.status === 201) {
        alert("Parent Sign-up successful!");
        // Redirect to Parent Dashboard after successful sign-up
        navigate("/parentDashboard"); // Navigate to dashboard page
      } else {
        alert("Registration failed: " + response.data.message);
      }
    } catch (error) {
      alert("Error during registration: " + error.message);
    }
  };

  // Handle input changes
  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handlePhoneChange = (e) => {
    setPhone(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-black via-blue-950 to-black text-white px-6">
      <h1 className="text-4xl font-bold text-indigo-400 mb-6">Parent Sign Up</h1>

      <div className="w-full max-w-md p-6 bg-gray-900 shadow-lg rounded-lg flex flex-col items-center">
        <div className="mb-4">
          <img
            src="https://media.giphy.com/media/hvRJCLFzcasrR4ia7z/giphy.gif"
            alt="Welcome GIF"
            className="w-20 h-20"
          />
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="flex flex-col">
            <label htmlFor="name" className="text-sm font-medium text-gray-300">Full Name</label>
            <input
              type="text"
              id="name"
              className="mt-1 p-2 w-full bg-gray-800 text-white border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Enter your full name"
              value={name}
              onChange={handleNameChange}
              required
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="password" className="text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              id="password"
              className="mt-1 p-2 w-full bg-gray-800 text-white border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Enter your password"
              value={password}
              onChange={handlePasswordChange}
              required
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="phone" className="text-sm font-medium text-gray-300">Phone Number</label>
            <input
              type="tel"
              id="phone"
              className="mt-1 p-2 w-full bg-gray-800 text-white border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Enter your phone number"
              value={phone}
              onChange={handlePhoneChange}
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
                onChange={handleOtpChange}
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
