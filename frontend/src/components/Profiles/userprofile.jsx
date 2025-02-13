"use client"

import { useState, useEffect } from "react";
import { User, Users, BookA, Mail, Book, Edit2, Upload } from "lucide-react";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";

export default function UserProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [userDetails, setUserDetails] = useState({
    username: "abc",
    gender: "Male",
    email: "abc@example.com",
    Age: 15,
    parentname: "abc",
  });
  const [image, setImage] = useState("profile.png"); // Default image

  // Fetch user details and profile image 
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch("/api/getUserProfile");
        if (response.ok) {
          const data = await response.json();
          // Set the user details
          setUserDetails(data);

          
          const profileImage = data.profileImage || "profile.png"; 
          setImage(profileImage);
        } else {
          console.error("Failed to fetch user profile");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []); 

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
    }
  };

  const handleEdit = (field, value) => {
    setUserDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    const formData = new FormData();

    // Append user details to formData
    Object.keys(userDetails).forEach((field) => {
      formData.append(field, userDetails[field]);
    });

    // Append the image to formData if it's changed
    const fileInput = document.getElementById("fileInput");
    if (fileInput.files[0]) {
      formData.append("profileImage", fileInput.files[0]);
    }

    try {
      const response = await fetch("/api/updateProfile", {
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

  return (
    <>
      <Navbar />
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
                {userDetails.username}
              </h2>
              <p className="text-blue-400">{userDetails.email}</p>
              <div className="mt-6 w-full">
                <div className="flex items-center mb-3">
                  <User className="mr-2 text-blue-400" size={20} />
                  <span className="font-semibold text-gray-300">Username:</span>
                  <span className="ml-2 text-gray-200">{userDetails.username}</span>
                </div>
                <div className="flex items-center mb-3">
                  <Mail className="mr-2 text-blue-400" size={20} />
                  <span className="font-semibold text-gray-300">Email:</span>
                  <span className="ml-2 text-gray-200">{userDetails.email}</span>
                </div>
                <div className="flex items-center mb-3">
                  <BookA className="mr-2 text-blue-400" size={20} />
                  <span className="font-semibold text-gray-300">Age:</span>
                  <span className="ml-2 text-gray-200">{userDetails.Age}</span>
                </div>
                <div className="flex items-center mb-3">
                  <Users className="mr-2 text-blue-400" size={20} />
                  <span className="font-semibold text-gray-300">Parent Name:</span>
                  <span className="ml-2 text-gray-200">{userDetails.parentname}</span>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="w-full md:w-2/3 p-8">
              <h1 className="text-3xl font-bold mb-6 text-gradient bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-indigo-500">
                Profile
              </h1>
              <div className="space-y-6">
                {Object.keys(userDetails).map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium mb-2 text-gray-400">
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </label>
                    <input
                      type={field === "journals" ? "number" : "text"}
                      value={userDetails[field]}
                      onChange={(e) => handleEdit(field, e.target.value)}
                      disabled={!isEditing}
                      className={`w-full bg-gray-900 rounded px-2 py-1 focus:ring-blue-500 ${
                        isEditing ? "border-2 borderwhite" : ""
                      }`}
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  if (isEditing) {
                    handleSaveProfile(); 
                  } else {
                    setIsEditing(true); 
                  }
                }}
                className="mt-8 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center transition-colors duration-300 transform hover:scale-105 "
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
