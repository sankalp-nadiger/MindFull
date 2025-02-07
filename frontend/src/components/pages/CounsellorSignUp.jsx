import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
  const [showPassword, setShowPassword] = useState(false); // Password visibility toggle

  const handleChange = (e) => {
    const value = e.target.type === "number" ? parseInt(e.target.value) || "" : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, certifications: e.target.files[0] });
  };

  const handleSendOtp = async () => {
    try {
      const response = await axios.post("http://localhost:8000/api/counsellor/send-otp", {
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
        "http://localhost:8000/api/counsellor/register-counsellor",
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold text-blue-400 mb-4">Counsellor Sign-Up</h1>
      <form className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md" onSubmit={handleSubmit}>
        {/* Personal details */}
        {["fullName", "email", "mobileNumber"].map((field) => (
          <div key={field} className="mb-4">
            <label className="block text-sm font-medium capitalize">{field}</label>
            <input
              type={field === "mobileNumber" ? "number" : "text"}
              name={field}
              value={formData[field]}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none"
              required
            />
          </div>
        ))}

        {/* Password Field with Toggle */}
        <div className="mb-4">
          <label className="block text-sm font-medium">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2 text-sm text-gray-400"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {/* Years of Experience */}
        <div className="mb-4">
          <label className="block text-sm font-medium">Years of Experience</label>
          <input
            type="number"
            name="yearExp"
            value={formData.yearExp}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none"
            required
          />
        </div>

        {/* Specifications */}
        <div className="mb-4">
          <label className="block text-sm font-medium">Specifications</label>
          {formData.specification.map((spec, index) => (
            <div key={index} className="flex space-x-4 mb-2">
              <input
                type="text"
                value={spec}
                onChange={(e) => handleSpecificationChange(e, index)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none"
                required
              />
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddSpecification}
            className="w-full p-2 bg-blue-500 hover:bg-blue-600 rounded-md"
          >
            Add Specification
          </button>
        </div>

        {/* Availability */}
        <div className="mb-4">
          <label className="block text-sm font-medium">Availability</label>
          {formData.availability.map((day, dayIndex) => (
            <div key={dayIndex} className="mb-4 p-4 border border-gray-600 rounded-md">
              <select
                value={day.day}
                onChange={(e) => handleDayChange(e, dayIndex)}
                className="w-full p-2 mb-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none"
              >
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              {day.slots.map((slot, slotIndex) => (
                <div key={slotIndex} className="flex space-x-4 mb-2">
                  <input
                    type="time"
                    value={slot.startTime}
                    onChange={(e) => handleAvailabilityChange(e, dayIndex, slotIndex, "startTime")}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none"
                    required
                  />
                  <input
                    type="time"
                    value={slot.endTime}
                    onChange={(e) => handleAvailabilityChange(e, dayIndex, slotIndex, "endTime")}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none"
                    required
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={() => handleAddSlot(dayIndex)}
                className="w-full mt-2 p-2 bg-blue-500 hover:bg-blue-600 rounded-md"
              >
                Add Slot
              </button>
            </div>
          ))}
        </div>

        {/* File Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium">Certifications</label>
          <input
            type="file"
            name="certifications"
            onChange={handleFileChange}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none"
          />
        </div>

        {/* Submit Button */}
        <div className="mb-4">
          <button
            type="submit"
            className="w-full p-2 bg-blue-500 hover:bg-blue-600 rounded-md"
          >
            Sign Up
          </button>
        </div>
      </form>
    </div>
  );
};

export default CounsellorSignUp;
