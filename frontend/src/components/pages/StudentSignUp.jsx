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
    <>
     <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "info" })} />
    <div className="min-h-screen font-poppins bg-gradient-to-b from-green-400 via-green-200 to-blue-300  flex items-center justify-center p-4 ">
      
     
        

      {/* Main container */}
      <div className="relative w-full max-w-6xl bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden ">
        <div className="flex flex-col lg:flex-row min-h-[600px] sm:min-h-[300px] ">
          
          {/* Left Panel - Welcome Section */}
          <div className="lg:w-1/2 bg-[#f2f8fc] p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
            
            {/* Decorative floating elements */}
            <div className="absolute top-10 right-10 w-20 h-20 bg-green-600/50 rounded-full animate-bounce delay-300"></div>
            
            <div className="absolute top-1/3 left-1/4 w-12 h-12 bg-blue-400/40 rounded-full animate-pulse"></div>
            
            
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
                Welcome <span className=" bg-gradient-to-r from-primaryblue to-primarygreen bg-clip-text text-transparent">
                   aboard !
                </span>
              </h1>
              
              <p className="text-gray-700 text-lg mb-8 leading-relaxed">
                You’ve shown up today, and that’s already progress. Mental wellness is not about perfection—it’s about choosing yourself, every single day
              </p>
              <div className="w-full flex justify-center items-center p-4">
      <img
        src="/hea10.png" // replace with your image path
        alt="Descriptive Alt Text"
        className="w-full max-w-4xl h-auto object-contain "
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

            <div className="relative z-10 w-full  ">
             
   
    <div className="auth-page">
     
    <div className="auth-container">
      <div className="auth-card">
        <div className="card-header">
          <h2 className="card-title">Sign Up</h2>
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
              onKeyDown={handleKeyDown}
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
              onKeyDown={handleKeyDown}
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
              onKeyDown={handleKeyDown}
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
              onKeyDown={handleKeyDown}
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
              onKeyDown={handleKeyDown}
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
            <Link to="/signin" className="auth-link">
              Sign in here
            </Link>
          </p>
          
        </div>
      </div>
      </div>
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
    </div>

     </>
  );
};

export default StudentSignUp;