import React, { useState } from "react";
import axios from "axios";
import "./StudentSignIn.css";
import Toast from "./Toast";
import { Link, useNavigate } from "react-router-dom";
const CounsellorSignUp = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    mobileNumber: "",
    otp: "",
    specification: [""],
    availability: [
      { day: "Monday", slots: [] },
      { day: "Tuesday", slots: [] },
      { day: "Wednesday", slots: [] },
      { day: "Thursday", slots: [] },
      { day: "Friday", slots: [] },
      { day: "Saturday", slots: [] },
      { day: "Sunday", slots: [] },
    ],
    certifications: [],
    yearExp: "",
  });

  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fileNames, setFileNames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [otpTimer, setOtpTimer] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [toast, setToast] = useState({ message: "", type: "info" });
  const [errorCount, setErrorCount] = useState(0);

  // Start OTP timer
  const startOtpTimer = () => {
    setOtpTimer(60);
    const timer = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Validation helpers
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateMobile = (mobile) => mobile.length === 10 && /^\d+$/.test(mobile);
  const validatePassword = (password) => password.length >= 6;

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const processedValue = type === "number" ? (parseInt(value) || "") : value;
    
    setFormData({ ...formData, [name]: processedValue });
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Validate each file
      const validFiles = [];
      const invalidFiles = [];
      
      files.forEach(file => {
        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          invalidFiles.push(`${file.name} is too large (max 5MB)`);
          return;
        }
        
        // Validate file type
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
          invalidFiles.push(`${file.name} is not a supported format`);
          return;
        }
        
        validFiles.push(file);
      });
      
      if (invalidFiles.length > 0) {
        setErrors({ ...errors, certifications: invalidFiles.join(', ') });
        return;
      }
      
      // Add new files to existing ones
      const updatedFiles = [...formData.certifications, ...validFiles];
      setFormData({ ...formData, certifications: updatedFiles });
      setFileNames(updatedFiles.map(file => file.name));
      setErrors({ ...errors, certifications: "" });
    }
  };

  const handleSendOtp = async () => {
    // Validate mobile number first
    if (!validateMobile(formData.mobileNumber)) {
      setErrors({ ...errors, mobileNumber: "Please enter a valid 10-digit mobile number" });
      return;
    }

    setOtpLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_API_URL}/counsellor/send-otp`, {
        mobileNumber: parseInt(formData.mobileNumber),
      });
      if (response.data.success) {
        setOtpSent(true);
        startOtpTimer();
        setToast({ message: "OTP sent to your phone!", type: "success" });
        setErrors({ ...errors, mobileNumber: "" });
      } else {
        setToast({ message: (response.data?.message || "Failed to send OTP.") + " If the issue persists, please contact the developer.", type: "error" });
      }
    } catch (error) {
      setToast({ message: (error.response?.data?.message || "Error sending OTP.") + " If the issue persists, please contact the developer.", type: "error" });
    } finally {
      setOtpLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!validateEmail(formData.email)) newErrors.email = "Please enter a valid email";
    if (!validateMobile(formData.mobileNumber)) newErrors.mobileNumber = "Please enter a valid 10-digit mobile number";
    if (!validatePassword(formData.password)) newErrors.password = "Password must be at least 6 characters";
    if (!formData.otp) newErrors.otp = "OTP is required";
    if (!formData.yearExp || formData.yearExp < 0) newErrors.yearExp = "Please enter valid years of experience";
    if (formData.specification.some(spec => !spec.trim())) newErrors.specification = "All specifications must be filled";
    
    // Check if at least one day has slots
    const hasAvailability = formData.availability.some(day => day.slots.length > 0);
    if (!hasAvailability) newErrors.availability = "Please add at least one time slot";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showErrorToast = (msg) => {
    setErrorCount((prev) => prev + 1);
    const suffix = errorCount >= 2 ? " If the issue persists, please contact the developer." : "";
    setToast({ message: msg + suffix, type: "error" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setToast({ message: "Please fix the errors in the form", type: "error" });
      return;
    }

    // Additional client-side validation
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.password.trim() || !formData.mobileNumber.trim()) {
      showErrorToast("Please fill all required fields.");
      return;
    }
    if (!validateEmail(formData.email)) {
      showErrorToast("Please enter a valid email address.");
      return;
    }
    if (!validateMobile(formData.mobileNumber)) {
      showErrorToast("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!validatePassword(formData.password)) {
      showErrorToast("Password must be at least 6 characters.");
      return;
    }
    if (!otpSent) {
      try {
        const response = await axios.post(`${import.meta.env.VITE_BASE_API_URL}/counsellor/send-otp`, { mobileNumber: formData.mobileNumber });
        if (response.data.success) {
          setOtpSent(true);
          setOtpTimer(60);
          setToast({ message: "OTP sent to your phone!", type: "success" });
          // ...existing timer code...
        } else {
          setToast({ message: (response.data?.message || "Failed to send OTP.") + " If the issue persists, please contact the developer.", type: "error" });
        }
      } catch (error) {
        setToast({ message: (error.response?.data?.message || "Error sending OTP.") + " If the issue persists, please contact the developer.", type: "error" });
      }
      return;
    }
    if (formData.otp.length !== 6) {
      showErrorToast("Please enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      const submissionData = {
        ...formData,
        mobileNumber: parseInt(formData.mobileNumber),
        yearExp: parseInt(formData.yearExp),
        availability: JSON.stringify(formData.availability.map(day => ({
          day: day.day,
          slots: day.slots.map(slot => ({
            startTime: slot.startTime,
            endTime: slot.endTime
          }))
        })))
      };

      const formDataObj = new FormData();
      Object.keys(submissionData).forEach((key) => {
        if (key === "certifications" && submissionData[key]) {
          formDataObj.append(key, submissionData[key]);
        } else if (Array.isArray(submissionData[key]) || typeof submissionData[key] === "object") {
          formDataObj.append(key, JSON.stringify(submissionData[key]));
        } else {
          formDataObj.append(key, submissionData[key]);
        }
      });

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_API_URL}/counsellor/register`,
        formDataObj,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201) {
        setToast({ message: "Counsellor Sign-up successful!", type: "success" });
        setTimeout(() => navigate("/counsellorDashboard"), 1200);
      } else {
        setToast({ message: (response.data?.message || "Registration failed.") + " If the issue persists, please contact the developer.", type: "error" });
      }
    } catch (error) {
      setToast({ message: (error.response?.data?.message || "Error during registration.") + " If the issue persists, please contact the developer.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSpecificationChange = (e, index) => {
    const updatedSpecification = [...formData.specification];
    updatedSpecification[index] = e.target.value;
    setFormData({ ...formData, specification: updatedSpecification });
    
    // Clear specification error
    if (errors.specification) {
      setErrors({ ...errors, specification: "" });
    }
  };

  const handleAddSpecification = () => {
    setFormData({ ...formData, specification: [...formData.specification, ""] });
  };

  const handleRemoveSpecification = (index) => {
    if (formData.specification.length > 1) {
      const updatedSpecification = formData.specification.filter((_, i) => i !== index);
      setFormData({ ...formData, specification: updatedSpecification });
    }
  };

  const handleAvailabilityChange = (e, dayIndex, slotIndex, field) => {
    const updatedAvailability = [...formData.availability];
    updatedAvailability[dayIndex].slots[slotIndex] = {
      ...updatedAvailability[dayIndex].slots[slotIndex],
      [field]: e.target.value,
    };
    setFormData({ ...formData, availability: updatedAvailability });
    
    // Clear availability error
    if (errors.availability) {
      setErrors({ ...errors, availability: "" });
    }
  };

  const handleAddSlot = (dayIndex) => {
    const updatedAvailability = [...formData.availability];
    updatedAvailability[dayIndex].slots.push({ startTime: "", endTime: "" });
    setFormData({ ...formData, availability: updatedAvailability });
  };

  const handleRemoveSlot = (dayIndex, slotIndex) => {
    const updatedAvailability = [...formData.availability];
    updatedAvailability[dayIndex].slots.splice(slotIndex, 1);
    setFormData({ ...formData, availability: updatedAvailability });
  };

  const handleDayChange = (e, dayIndex) => {
    const updatedAvailability = [...formData.availability];
    updatedAvailability[dayIndex].day = e.target.value;
    setFormData({ ...formData, availability: updatedAvailability });
  };

  // Helper function to count valid time slots (both start and end time filled)
  const getValidSlotCount = (slots) => {
    return slots.filter(slot => slot.startTime && slot.endTime).length;
  };

  // Helper function to check if time slots are valid
  const isValidTimeSlot = (startTime, endTime) => {
    return startTime && endTime && startTime < endTime;
  };

  // Helper function to remove a file from certifications
  const removeFile = (indexToRemove) => {
    const updatedFiles = formData.certifications.filter((_, index) => index !== indexToRemove);
    setFormData({ ...formData, certifications: updatedFiles });
    setFileNames(updatedFiles.map(file => file.name));
  };

  return (
    <>
     <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "info" })} />
 <div className="min-h-screen font-poppins bg-gradient-to-b from-primarygreen via-[#1fa313] to-primaryblue flex items-center justify-center p-4 ">
      {/* Animated background elements */}
     
        <div className="absolute -top-40 -right-40 w-80 h-80  rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-pulse delay-500"></div>
      

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
                src="/plant.png"
                className="w-auto lg:h-16 h-10"
                alt="Logo"
              />
                  </div>
                </div>
                <span className="ml-3 text-green-900 text-3xl font-bold tracking-wide">MindFull</span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-primarygreen mb-6 leading-tight">
                Welcome <span className=" bg-gradient-to-r from-primaryblue to-primarygreen bg-clip-text text-transparent">
                   aboard !
                </span>
              </h1>
              
              <p className="text-gray-700 text-lg mb-8 leading-relaxed">
                You’ve shown up today, and that’s already progress. Mental wellness is not about perfection—it’s about choosing yourself, every single day
              </p>
              <div className="w-full flex h-full justify-center items-center p-4">
      <img
        src="/hea10.png" // replace with your image path
        alt="Descriptive Alt Text"
        className="w-full max-w-4xl h-full  object-contain "
      />
    </div>
            </div>

            

            {/* Geometric decorations */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/10 to-transparent transform rotate-45 translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-400/20 to-transparent transform -rotate-12 -translate-x-8 translate-y-8"></div>
          </div>

          {/* Right Panel - Form Section */}
          <div className="lg:w-1/2 bg-white/5 backdrop-blur-sm   flex flex-col  relative">
            
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
          <div className="card-header">
            <h2 className="card-title">Counsellor Sign-Up</h2>
            <p className="text-violet-500">Join our platform to support students, parents & mentally disturbed individuals</p>
          </div>
          
          <form className="form-container" onSubmit={handleSubmit}>
            {/* Personal Details Section */}
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`form-input ${errors.fullName ? 'error' : ''}`}
                placeholder="Enter your full name"
                required
              />
              {errors.fullName && <span className="error-message">{errors.fullName}</span>}
            </div>
            
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="Enter your email address"
                required
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
            
            <div className="form-group">
              <label className="form-label">Mobile Number *</label>
              <div className="otp-container">
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  className={`form-input otp-input ${errors.mobileNumber ? 'error' : ''}`}
                  placeholder="10-digit mobile number"
                  maxLength="10"
                  required
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="action-button"
                  disabled={!formData.mobileNumber || otpLoading || otpTimer > 0}
                >
                  {otpLoading ? "Sending..." : otpTimer > 0 ? `Resend (${otpTimer}s)` : otpSent ? "Resend OTP" : "Send OTP"}
                </button>
              </div>
              {errors.mobileNumber && <span className="error-message">{errors.mobileNumber}</span>}
            </div>
            
            {otpSent && (
              <div className="form-group">
                <label className="form-label">OTP *</label>
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  className={`form-input ${errors.otp ? 'error' : ''}`}
                  placeholder="Enter the 6-digit OTP"
                  maxLength="6"
                  required
                />
                {errors.otp && <span className="error-message">{errors.otp}</span>}
                <small className="form-hint">OTP sent to your mobile number</small>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Password *</label>
              <div className="input-with-button">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="Minimum 6 characters"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="input-button"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Years of Experience *</label>
              <input
                type="number"
                name="yearExp"
                value={formData.yearExp}
                onChange={handleChange}
                className={`form-input ${errors.yearExp ? 'error' : ''}`}
                placeholder="Enter years of experience"
                min="0"
                required
              />
              {errors.yearExp && <span className="error-message">{errors.yearExp}</span>}
            </div>

            {/* Specifications Section */}
            <div className="form-group">
              <label className="form-label">Areas of Specialization *</label>
              {formData.specification.map((spec, index) => (
                <div key={index} className="mb-3 flex gap-2">
                  <input
                    type="text"
                    value={spec}
                    onChange={(e) => handleSpecificationChange(e, index)}
                    className={`form-input flex-1 ${errors.specification ? 'error' : ''}`}
                    placeholder="e.g., Anxiety, Depression, Family Counseling"
                    required
                  />
                  {formData.specification.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSpecification(index)}
                      className="remove-button"
                      title="Remove specification"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              {errors.specification && <span className="error-message">{errors.specification}</span>}
              <button
                type="button"
                onClick={handleAddSpecification}
                className="secondary-button"
              >
                + Add Another Specialization
              </button>
            </div>

            {/* Availability Section */}
            <div className="form-group">
              <label className="form-label">Availability Schedule *</label>
              <small className="form-hint">Add your available time slots for each day</small>
              {formData.availability.map((day, dayIndex) => (
                <div key={dayIndex} className="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-800">{day.day}</h4>
                    <span className="text-sm text-gray-600">
                      {getValidSlotCount(day.slots)} slot{getValidSlotCount(day.slots) !== 1 ? 's' : ''} added
                    </span>
                  </div>

                  {day.slots.map((slot, slotIndex) => (
                    <div key={slotIndex} className="flex gap-2 mb-2 items-center">
                      <select
                        value={slot.startTime}
                        onChange={(e) => handleAvailabilityChange(e, dayIndex, slotIndex, "startTime")}
                        className="form-input select-input"
                        required
                      >
                        <option value="">Start Time</option>
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, '0');
                          return [
                            <option key={`${hour}:00`} value={`${hour}:00`}>{`${hour}:00`}</option>,
                            <option key={`${hour}:30`} value={`${hour}:30`}>{`${hour}:30`}</option>
                          ];
                        }).flat()}
                      </select>
                      <span className="text-gray-500">to</span>
                      <select
                        value={slot.endTime}
                        onChange={(e) => handleAvailabilityChange(e, dayIndex, slotIndex, "endTime")}
                        className="form-input select-input"
                        required
                      >
                        <option value="">End Time</option>
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, '0');
                          return [
                            <option key={`${hour}:00`} value={`${hour}:00`}>{`${hour}:00`}</option>,
                            <option key={`${hour}:30`} value={`${hour}:30`}>{`${hour}:30`}</option>
                          ];
                        }).flat()}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemoveSlot(dayIndex, slotIndex)}
                        className="remove-button"
                        title="Remove time slot"
                      >
                        ×
                      </button>
                      {slot.startTime && slot.endTime && !isValidTimeSlot(slot.startTime, slot.endTime) && (
                        <span className="text-red-500 text-sm">Invalid time range</span>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => handleAddSlot(dayIndex)}
                    className="secondary-button text-sm"
                  >
                    + Add Time Slot
                  </button>
                </div>
              ))}
              {errors.availability && <span className="error-message">{errors.availability}</span>}
            </div>

            {/* File Upload Section */}
            <div className="form-group">
              <label className="form-label">Certifications</label>
              <div className="file-input-container">
                <label className="file-input-label">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <span className="file-input-text">
                    {formData.certifications.length > 0 
                      ? `${formData.certifications.length} file${formData.certifications.length !== 1 ? 's' : ''} selected`
                      : "Choose files"
                    }
                  </span>
                  <input
                    type="file"
                    name="certifications"
                    onChange={handleFileChange}
                    className="file-input"
                    accept=".pdf,.doc,.docx"
                    multiple
                  />
                </label>
              </div>
              
              {/* Display selected files */}
              {formData.certifications.length > 0 && (
                <div className="mt-2">
                  <small className="form-hint">Selected files:</small>
                  <div className="selected-files-list">
                    {formData.certifications.map((file, index) => (
                      <div key={index} className="selected-file-item">
                        <span className="file-name">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="remove-file-button"
                          title="Remove file"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {errors.certifications && <span className="error-message">{errors.certifications}</span>}
              <small className="form-hint">Upload your certifications (PDF, DOC, DOCX - Max 5MB each, Multiple files allowed)</small>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Sign Up as Counsellor"}
            </button>
            
            <div className="auth-links">
              Already have an account? <a href="/counsellor-signin" className="auth-link">Login here</a>
               <p>
                          
                          <Link to="/signin" className="auth-link text-primaryblue">
                            Return to role selection
                          </Link>
                        </p>
            </div>
           
          </form>
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
      </>
  );
};

export default CounsellorSignUp;