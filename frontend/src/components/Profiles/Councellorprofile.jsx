"use client"

import { useState, useEffect } from "react";
import { User, Users, Mail, BookA, Edit2, Upload } from "lucide-react";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";

export default function CounselorProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [counselorDetails, setCounselorDetails] = useState({
    fullName: "ABC",
    email: "ABC.doe@example.com",
    Expereince: "5",
    mobileNumber: 1234567890,
    certifications: ["Certification 1", "Certification 2"],
    specification: "Psychology, Career Counseling", 
    availability: [
      {
        day: "Monday",
        slots: [{ startTime: "09:00 AM", endTime: "12:00 PM" }]
      }
    ],
    isAvailable: true,
  });
  const [image, setImage] = useState("profile.png");

  useEffect(() => {
    const fetchCounselorProfile = async () => {
      try {
        const response = await fetch("/api/getCounsellorProfile");
        if (response.ok) {
          const data = await response.json();
          setCounselorDetails(data);
          const profileImage = data.profileImage || "profile.png";
          setImage(profileImage);
        } else {
          console.error("Failed to fetch counselor profile");
        }
      } catch (error) {
        console.error("Error fetching counselor profile:", error);
      }
    };

    fetchCounselorProfile();
  }, []);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
    }
  };

  const handleEdit = (field, value) => {
    setCounselorDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    const formData = new FormData();
    Object.keys(counselorDetails).forEach((field) => {
      formData.append(field, counselorDetails[field]);
    });

    const fileInput = document.getElementById("fileInput");
    if (fileInput.files[0]) {
      formData.append("profileImage", fileInput.files[0]);
    }

    try {
      const response = await fetch("/api/updateCounsellorProfile", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Profile updated successfully");
        setIsEditing(false);
      } else {
        alert("Failed to update profile. Please try again.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("There was an error while updating the profile.");
    }
  };

  const handleAvailabilityChange = (index, day, slotType, value) => {
    const updatedAvailability = [...counselorDetails.availability];
    if (slotType === "day") {
      updatedAvailability[index].day = value;
    } else if (slotType === "startTime") {
      updatedAvailability[index].slots[0].startTime = value;
    } else if (slotType === "endTime") {
      updatedAvailability[index].slots[0].endTime = value;
    }
    setCounselorDetails((prev) => ({
      ...prev,
      availability: updatedAvailability,
    }));
  };

  const handleSpecificationChange = (value) => {
    setCounselorDetails((prev) => ({
      ...prev,
      specification: value,
    }));
  };

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-b from-blue-600 via-blue-800 to-black text-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl bg-gradient-to-b from-blue-800 via-blue-950 to-black rounded-lg shadow-2xll border-white border-y-2 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Side Panel */}
            <div className="w-full md:w-1/3 bg-gray-950 p-6 flex flex-col items-center">
              <div className="relative">
                <img
                  src={image}
                  className="w-40 h-40 rounded-full object-cover border-4 border-blue-500 transition-transform duration-300 hover:scale-105 transform hover:rotate-12"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="fileInput"
                />
                <button
                  onClick={() => document.getElementById("fileInput").click()}
                  className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full hover:bg-blue-600 transition-colors duration-300"
                >
                  <Upload size={20} />
                </button>
              </div>
              <h2 className="mt-4 text-2xl font-bold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-100 to-indigo-500">
                {counselorDetails.fullName}
              </h2>
              <p className="text-blue-400">{counselorDetails.email}</p>
              <div className="mt-6 w-full">
                <div className="flex items-center mb-3">
                  <User className="mr-2 text-blue-400" size={20} />
                  <span className="font-semibold text-gray-300">Full Name:</span>
                  <span className="ml-2 text-gray-200">{counselorDetails.fullName}</span>
                </div>
                <div className="flex items-center mb-3">
                  <Mail className="mr-2 text-blue-400" size={20} />
                  <span className="font-semibold text-gray-300">Email:</span>
                  <span className="ml-2 text-gray-200">{counselorDetails.email}</span>
                </div>
                <div className="flex items-center mb-3">
                  <Users className="mr-2 text-blue-400" size={20} />
                  <span className="font-semibold text-gray-300">Mobile:</span>
                  <span className="ml-2 text-gray-200">{counselorDetails.mobileNumber}</span>
                </div>
                <div className="flex items-center mb-3">
                  <BookA className="mr-2 text-blue-400" size={20} />
                  <span className="font-semibold text-gray-300">Experience:</span>
                  <span className="ml-2 text-gray-200">{counselorDetails.Expereince} years</span>
                </div>
                
                
              </div>
            </div>

            {/* Main Content */}
            <div className="w-full md:w-2/3 p-8">
              <h1 className="text-3xl font-bold mb-6 text-gradient bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-indigo-500">
                Profile
              </h1>
              <div className="space-y-6">
                {Object.keys(counselorDetails).map((field) => (
                  field !== "specification" && field !== "availability" && (
                    <div key={field}>
                      <label className="block text-sm font-medium mb-2 text-gray-400">
                        {field.charAt(0).toUpperCase() + field.slice(1)}
                      </label>
                      <input
                        type={field === "yearexp" ? "number" : "text"}
                        value={counselorDetails[field]}
                        onChange={(e) => handleEdit(field, e.target.value)}
                        disabled={!isEditing}
                        className={`w-full bg-gray-900 rounded px-2 py-1 focus:ring-blue-500 ${isEditing ? "border-2 border-white" : ""}`}
                      />
                    </div>
                  )
                ))}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-400">Specializations</label>
                  <input
                    type="text"
                    value={counselorDetails.specification}
                    onChange={(e) => handleSpecificationChange(e.target.value)}
                    disabled={!isEditing}
                    className="w-full bg-gray-900 rounded px-2 py-1 mb-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-400">Availability</label>
                  {counselorDetails.availability.map((avail, index) => (
                    <div key={index} className="mb-3">
                    <label className="block text-sm font-medium mb-2 text-gray-400">DAY</label>
                      <input
                        type="text"
                        value={avail.day}
                        onChange={(e) => handleAvailabilityChange(index, avail.day, "day", e.target.value)}
                        disabled={!isEditing}
                        className="w-full bg-gray-900 rounded px-2 py-1 mb-2 focus:ring-blue-500"
                      />
                    <label className="block text-sm font-medium mb-2 text-gray-400">FROM</label>
                      <input
                        type="time"
                        value={avail.slots[0].startTime}
                        onChange={(e) => handleAvailabilityChange(index, avail.day, "startTime", e.target.value)}
                        disabled={!isEditing}
                        className="w-full bg-gray-900 rounded px-2 py-1 mb-2 focus:ring-blue-500"
                      />
                      <select
                        value={avail.slots[0].startTime.slice(-2)}
                        onChange={(e) => handleAvailabilityChange(index, avail.day, "startTime", avail.slots[0].startTime.slice(0, -2) + e.target.value)}
                        disabled={!isEditing}
                        className="w-full bg-gray-900 rounded px-2 py-1 mb-2 focus:ring-blue-500"
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                      <label className="block text-sm font-medium mb-2 text-gray-400">TO</label>
                      <input
                        type="time"
                        value={avail.slots[0].endTime}
                        onChange={(e) => handleAvailabilityChange(index, avail.day, "endTime", e.target.value)}
                        disabled={!isEditing}
                        className="w-full bg-gray-900 rounded px-2 py-1 mb-2 focus:ring-blue-500"
                      />
                      <select
                        value={avail.slots[0].endTime.slice(-2)}
                        onChange={(e) => handleAvailabilityChange(index, avail.day, "endTime", avail.slots[0].endTime.slice(0, -2) + e.target.value)}
                        disabled={!isEditing}
                        className="w-full bg-gray-900 rounded px-2 py-1 mb-2 focus:ring-blue-500"
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => (isEditing ? handleSaveProfile() : setIsEditing(!isEditing))}
                className="mt-8 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center transition-colors duration-300 transform hover:scale-105"
              >
                <Edit2 size={20} className="mr-2" />
                {isEditing ? "Save Profile" : "Edit Profile"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
