import React, { useState } from "react";

const CounselorSignUp = () => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [fullName, setFullName] = useState("");
  const [yearExp, setYearExp] = useState("");
  const [password, setPassword] = useState("");
  const [certifications, setCertifications] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  // Handle Send OTP
  const handleSendOtp = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("http://localhost:8000/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, email }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to send OTP");
      }

      setOtpSent(true);
      setSuccess("OTP sent successfully!");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  // Handle OTP Verification
  const handleVerifyOtp = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("http://localhost:8000/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "OTP verification failed");
      }

      setOtpVerified(true);
      setSuccess("OTP verified successfully!");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  // Handle Final Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("mobileNumber", phone);
    formData.append("yearExp", yearExp);

    if (certifications) {
      Array.from(certifications).forEach(file => {
        formData.append("certifications", file);
      });
    }

    try {
      const response = await fetch("http://localhost:8000/api/counsellor/register-counsellor", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setSuccess("Counselor registered successfully!");
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-black via-blue-950 to-black text-white px-6">
      <h1 className="text-4xl font-bold text-indigo-400 mb-6">Counselor Sign Up</h1>

      <div className="w-full max-w-md p-6 bg-gray-900 shadow-lg rounded-lg flex flex-col items-center">
        {error && <div className="text-red-500">{error}</div>}
        {success && <div className="text-green-500">{success}</div>}

        {/* Step 1: Enter Basic Info */}
        {!otpSent && (
          <>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-300">Full Name</label>
              <input
                type="text"
                className="mt-1 p-2 w-full bg-gray-800 text-white border border-gray-700 rounded-md"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col mt-4">
              <label className="text-sm font-medium text-gray-300">Phone</label>
              <input
                type="tel"
                className="mt-1 p-2 w-full bg-gray-800 text-white border border-gray-700 rounded-md"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col mt-4">
              <label className="text-sm font-medium text-gray-300">Email</label>
              <input
                type="email"
                className="mt-1 p-2 w-full bg-gray-800 text-white border border-gray-700 rounded-md"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={handleSendOtp}
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </>
        )}

        {/* Step 2: Enter OTP */}
        {otpSent && !otpVerified && (
          <>
            <div className="flex flex-col mt-4">
              <label className="text-sm font-medium text-gray-300">Enter OTP</label>
              <input
                type="text"
                className="mt-1 p-2 w-full bg-gray-800 text-white border border-gray-700 rounded-md"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>

            <button
              className="w-full mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              onClick={handleVerifyOtp}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        )}

        {/* Step 3: Enter Additional Details */}
        {otpVerified && (
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-300">Years of Experience</label>
              <input
                type="text"
                className="mt-1 p-2 w-full bg-gray-800 text-white border border-gray-700 rounded-md"
                placeholder="Years of Experience"
                value={yearExp}
                onChange={(e) => setYearExp(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-300">Upload Certifications</label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setCertifications(e.target.files)}
              />
            </div>

            <button className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600" type="submit">
              {loading ? "Submitting..." : "Submit"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CounselorSignUp;
