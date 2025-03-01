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
    certifications: null,
    yearExp: "",
  });

  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fileName, setFileName] = useState("No file chosen");

  const handleChange = (e) => {
    const value = e.target.type === "number" ? parseInt(e.target.value) || "" : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, certifications: e.target.files[0] });
    setFileName(e.target.files[0]?.name || "No file chosen");
  };

  const handleSendOtp = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_API_URL}/counsellor/send-otp`, {
        mobileNumber: parseInt(formData.mobileNumber),
      });
      if (response.data.success) {
        setOtpSent(true);
        alert("OTP sent successfully!");
      }
    } catch (error) {
      console.error("OTP error:", error);
      alert("Error sending OTP: " + (error.response?.data?.message || error.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        if (key === "certifications" && Array.isArray(submissionData[key]) && submissionData[key].length > 0) {
          submissionData[key].forEach(file => {
            formDataObj.append(key, file);
          });
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
    }
  };

  const handleSpecificationChange = (e, index) => {
    const updatedSpecification = [...formData.specification];
    updatedSpecification[index] = e.target.value;
    setFormData({ ...formData, specification: updatedSpecification });
  };

  const handleAddSpecification = () => {
    setFormData({ ...formData, specification: [...formData.specification, ""] });
  };

  const handleAvailabilityChange = (e, dayIndex, slotIndex, field) => {
    const updatedAvailability = [...formData.availability];
    updatedAvailability[dayIndex].slots[slotIndex] = {
      ...updatedAvailability[dayIndex].slots[slotIndex],
      [field]: e.target.value,
    };
    setFormData({ ...formData, availability: updatedAvailability });
  };

  const handleAddSlot = (dayIndex) => {
    const updatedAvailability = [...formData.availability];
    updatedAvailability[dayIndex].slots.push({ startTime: "", endTime: "" });
    setFormData({ ...formData, availability: updatedAvailability });
  };

  const handleDayChange = (e, dayIndex) => {
    const updatedAvailability = [...formData.availability];
    updatedAvailability[dayIndex].day = e.target.value;
    setFormData({ ...formData, availability: updatedAvailability });
  };

  return (
    <div className="auth-container">
      <h1 className="app-title">Mental Health Support</h1>
      <div className="auth-card">
        <div className="card-header">
          <h2 className="card-title">Counsellor Sign-Up</h2>
          <p>Join our platform to support students and parents</p>
        </div>
        
        <form className="form-container" onSubmit={handleSubmit}>
          {/* Personal details */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Mobile Number</label>
            <div className="otp-container">
              <input
                type="number"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                className="form-input otp-input"
                required
              />
              <button
                type="button"
                onClick={handleSendOtp}
                className="action-button"
                disabled={!formData.mobileNumber}
              >
                Send OTP
              </button>
            </div>
          </div>
          
          {otpSent && (
            <div className="form-group">
              <label className="form-label">OTP</label>
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-button">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
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
          </div>

          <div className="form-group">
            <label className="form-label">Years of Experience</label>
            <input
              type="number"
              name="yearExp"
              value={formData.yearExp}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          {/* Specifications */}
          <div className="form-group">
            <label className="form-label">Specifications</label>
            {formData.specification.map((spec, index) => (
              <div key={index} className="mb-3">
                <input
                  type="text"
                  value={spec}
                  onChange={(e) => handleSpecificationChange(e, index)}
                  className="form-input"
                  placeholder="e.g., Anxiety, Depression, etc."
                  required
                />
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddSpecification}
              className="secondary-button"
            >
              Add Specification
            </button>
          </div>

          {/* Availability */}
          <div className="form-group">
            <label className="form-label">Availability</label>
            {formData.availability.map((day, dayIndex) => (
              <div key={dayIndex} className="mb-4 p-4 border border-gray-200 rounded-md">
                <select
                  value={day.day}
                  onChange={(e) => handleDayChange(e, dayIndex)}
                  className="form-input select-input mb-3"
                >
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>

                {day.slots.map((slot, slotIndex) => (
                  <div key={slotIndex} className="flex gap-2 mb-2">
                    <input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => handleAvailabilityChange(e, dayIndex, slotIndex, "startTime")}
                      className="form-input"
                      required
                    />
                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => handleAvailabilityChange(e, dayIndex, slotIndex, "endTime")}
                      className="form-input"
                      required
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => handleAddSlot(dayIndex)}
                  className="secondary-button"
                >
                  Add Time Slot
                </button>
              </div>
            ))}
          </div>

          {/* File Upload */}
          <div className="form-group">
            <label className="form-label">Certifications</label>
            <div className="file-input-container">
              <label className="file-input-label">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <span className="file-input-text">{fileName}</span>
                <input
                  type="file"
                  name="certifications"
                  onChange={handleFileChange}
                  className="file-input"
                  accept=".pdf,.doc,.docx"
                />
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="primary-button"
          >
            Sign Up as Counsellor
          </button>
          
          <div className="auth-links">
            Already have an account? <a href="/counsellor-signin" className="auth-link">Login here</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CounsellorSignUp;