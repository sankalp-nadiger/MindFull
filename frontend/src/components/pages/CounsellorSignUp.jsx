import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./StudentSignIn.css"

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

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateMobile = (mobile) => {
    return mobile.length === 10 && /^\d+$/.test(mobile);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

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
        alert("OTP sent successfully!");
        setErrors({ ...errors, mobileNumber: "" });
      }
    } catch (error) {
      console.error("OTP error:", error);
      setErrors({ ...errors, otp: error.response?.data?.message || "Error sending OTP" });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert("Please fix the errors in the form");
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
        `${import.meta.env.VITE_BASE_API_URL}/counsellor/register-counsellor`,
        formDataObj,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201) {
        alert("Counsellor Sign-up successful!");
        navigate("/counsellor");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Registration failed: " + (error.response?.data?.message || error.message));
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
    <div className="auth-page">
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
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CounsellorSignUp;