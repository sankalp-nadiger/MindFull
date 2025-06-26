import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./StudentSignIn.css";
import Toast from "./Toast";

const StudentSignUp = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [idCardFile, setIdCardFile] = useState(null);
  const [idCardFileName, setIdCardFileName] = useState("No file chosen");
  const [location, setLocation] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "info" });
  const [errorCount, setErrorCount] = useState(0);

  const navigate = useNavigate();

  const getLocation = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const address = "Sample Address";

          const locationData = {
            type: "Point",
            coordinates: [longitude, latitude],
            address: address
          };

          setLocation(locationData);
          setToast({ message: "Location retrieved successfully!", type: "success" });
          setIsLocating(false);
        },
        (error) => {
          setToast({ message: "Unable to retrieve your location. Please enable geolocation.", type: "error" });
          setIsLocating(false);
        }
      );
    } else {
      setToast({ message: "Geolocation is not supported by this browser.", type: "error" });
    }
  };

  // Validation helpers
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateUsername = (username) => username && username.length >= 3 && !username.includes(" ");
  const validatePassword = (password) => password.length >= 6;

  const showErrorToast = (msg) => {
    setErrorCount((prev) => prev + 1);
    const suffix = errorCount >= 2 ? " If the issue persists, please contact the developer." : "";
    setToast({ message: msg + suffix, type: "error" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if ([fullName, email, username, password].some((field) => field.trim() === "")) {
      showErrorToast("Please fill out all required fields.");
      return;
    }
    if (!validateEmail(email)) {
      showErrorToast("Please enter a valid email address.");
      return;
    }
    if (!validateUsername(username)) {
      showErrorToast("Please enter a valid username (min 3 chars, no spaces).");
      return;
    }
    if (!validatePassword(password)) {
      showErrorToast("Password must be at least 6 characters.");
      return;
    }
    if (parseInt(age, 10) < 18 && !idCardFile) {
      showErrorToast("ID card upload is required for users under 18.");
      return;
    }
    if (!location) {
      showErrorToast("Location is required. Please allow location access.");
      return;
    }
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("email", email);
    formData.append("username", username);
    formData.append("password", password);
    formData.append("age", age);
    formData.append("gender", gender);
    formData.append("location", JSON.stringify(location));
    if (idCardFile) formData.append("idCardFile", idCardFile);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_API_URL}/users/register`, 
        formData, 
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      if (response.status === 201) {
        const { accessToken, createdUser } = response.data.data || {};

        setToast({ message: "Sign up successful!", type: "success" });
        setTimeout(() => navigate("/MainPage"), 1200);

        if (accessToken) {
          sessionStorage.setItem("accessToken", accessToken);
        }

        if (createdUser) {
          sessionStorage.setItem("user", JSON.stringify(createdUser));
        }
      } else {
        setToast({ message: (response.data?.message || "Registration failed.") + " If the issue persists, please contact the developer.", type: "error" });
      }
    } catch (error) {
      setToast({ message: (error.response?.data?.message || "Error during registration. Please try again.") + " If the issue persists, please contact the developer.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIdCardUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIdCardFile(file);
      setIdCardFileName(file.name);
      setToast({ message: "ID card uploaded successfully!", type: "success" });
    }
  };

  return (
    <div className="auth-page">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "info" })} />
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
        <div className="card-header">
          <h2 className="card-title">Student Sign Up</h2>
          <p className="text-indigo-600">Create your account to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-group">
            <label htmlFor="fullName" className="form-label">Full Name</label>
            <input
              type="text"
              id="fullName"
              className="form-input"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              className="form-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              id="username"
              className="form-input"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="input-with-button">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="form-input"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="input-button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="age" className="form-label">Age</label>
            <input
              type="number"
              id="age"
              className="form-input"
              placeholder="Enter your age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min="13"
              max="99"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="gender" className="form-label">Gender</label>
            <select
              id="gender"
              className="form-input select-input"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Location</label>
            <button 
              type="button" 
              className="action-button"
              onClick={getLocation}
              disabled={isLocating}
            >
              {isLocating ? "Getting Location..." : location ? "Location Received ✓" : "Get Location"}
            </button>
            {location && (
              <div className="mt-2 text-sm text-gray-600">
                Location data received successfully
              </div>
            )}
          </div>

          {parseInt(age, 10) < 18 && (
            <div className="form-group">
              <label htmlFor="idCard" className="form-label">Upload ID Card (Required for users under 18)</label>
              <div className="file-input-container">
                <div className="file-input-label">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <span className="file-input-text">{idCardFileName}</span>
                </div>
                <input
                  type="file"
                  id="idCard"
                  className="file-input"
                  onChange={handleIdCardUpload}
                  accept="image/*,.pdf"
                />
              </div>
            </div>
          )}

          <button 
            className="primary-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="auth-links">
          <p>
            Already have an account?{" "}
            <Link to="/student-signin" className="auth-link">
              Sign in here
            </Link>
          </p>
          <p>
            Not a student?{" "}
            <Link to="/role-selection" className="auth-link">
              Select your role
            </Link>
          </p>
        </div>
      </div>
      </div>
    </div>
  );
};

export default StudentSignUp;