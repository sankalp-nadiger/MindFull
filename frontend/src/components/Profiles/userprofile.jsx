"use client";

import { useState, useEffect } from "react";
import { User, Users, Mail, Book, Edit2, Upload, Star } from "lucide-react";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";

export default function UserProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [image, setImage] = useState("profile.png");
  const [newInterest, setNewInterest] = useState("");
  const [isGoal, setIsGoal] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const accessToken = sessionStorage.getItem("accessToken");
        if (!accessToken) {
          console.error("No access token found");
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/users/current`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setUserDetails(data.data);
          setImage(data.data.avatar || "profile.png");
        } else {
          console.error("Failed to fetch user profile");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);

      const formData = new FormData();
      formData.append("avatar", file);

      try {
        const accessToken = sessionStorage.getItem("accessToken");
        const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/users/update-avatar`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to update avatar");
        }
      } catch (error) {
        console.error("Error updating avatar:", error);
        setImage(userDetails.avatar || "profile.png");
      }
    }
  };

  const handleEdit = (field, value) => {
    setUserDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleInterestEdit = (index, field, value) => {
    setUserDetails((prev) => {
      const newInterests = [...prev.interests];
      newInterests[index] = { ...newInterests[index], [field]: value };
      return { ...prev, interests: newInterests };
    });
  };

  const handleAddInterest = async () => {
    if (newInterest.trim() === "") return;
    
    try {
      const accessToken = sessionStorage.getItem("accessToken");
      if (!accessToken) {
        alert("Authentication required.");
        return;
      }
  
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/users/add-interests`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          selected_interests: [newInterest],
          goal: isGoal ? newInterest : null
        })
      });
  
      if (response.ok) {
        setUserDetails((prev) => ({
          ...prev,
          interests: [...(prev.interests || []), { name: newInterest, goal: isGoal }],
        }));
        setNewInterest("");
        setIsGoal(false);
      } else {
        alert("Failed to add interest. Please try again.");
      }
    } catch (error) {
      console.error("Error adding interest:", error);
      alert("There was an error while adding the interest.");
    }
  };
  

  const handleRemoveInterest = (index) => {
    setUserDetails((prev) => ({
      ...prev,
      interests: prev.interests.filter((_, i) => i !== index),
    }));
  };

  const handleSaveProfile = async () => {
    if (!userDetails) return;

    const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken) {
      alert("Authentication required.");
      return;
    }

    const formData = new FormData();
    Object.keys(userDetails).forEach((key) => {
      if (key === "interests") {
        formData.append(key, JSON.stringify(userDetails[key]));
      } else if (key !== "avatar" && key !== "_id") {
        formData.append(key, userDetails[key]);
      }
    });

    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/users/update`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
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

  if (!userDetails) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-blue-600 via-blue-800 to-black text-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl bg-gradient-to-b from-blue-800 via-blue-950 to-black rounded-lg shadow-2xl border-white border-y-2 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Side Panel */}
            <div className="w-full md:w-1/3 bg-gray-950 p-6 flex flex-col items-center">
              <div className="relative">
                <img
                  src={image}
                  className="w-40 h-40 rounded-full object-cover border-4 border-blue-500 transition-transform duration-300 hover:scale-105"
                  alt="Profile"
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
                {userDetails.fullName}
              </h2>
              <p className="text-blue-400">{userDetails.email}</p>
            </div>

            {/* Main Content */}
            <div className="w-full md:w-2/3 p-8">
              <h1 className="text-3xl font-bold mb-6 text-gradient bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-indigo-500">
                Profile
              </h1>
              <div className="space-y-6">
                {/* Basic Details */}
                {Object.entries(userDetails).map(([field, value]) => {
  // Expanded list of fields to exclude
  const excludedFields = [
    "interests",
    "journals",
    "_id",
    "avatar",
    "goals",
    "events",
    "location",
    "progress",
    "refreshToken",
    "createdAt",
    "updatedAt",
    "lastLoginDate",
    "issues",
    "parent",
    "__v"
  ];
  
  if (excludedFields.includes(field)) return null;
  
  return (
    <div key={field}>
      <label className="block text-sm font-medium mb-2 text-gray-400">
        {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => handleEdit(field, e.target.value)}
        disabled={!isEditing || field === 'parent_phone_no'} // Add condition here
        className={`w-full bg-gray-900 rounded px-2 py-1 focus:ring-blue-500 border-white ${
          field === 'parent_phone_no' ? 'cursor-not-allowed opacity-70' : ''
        }`}
      />
    </div>
  );
})}


                {/* Interests Section */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-400">Interests & Goals</label>
                  <div className="space-y-2">
                    {userDetails.interests?.map((interest, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={interest.name}
                          onChange={(e) => handleInterestEdit(index, "name", e.target.value)}
                          disabled={!isEditing}
                          className="flex-1 bg-gray-900 rounded px-2 py-1 focus:ring-blue-500 border-white"
                        />
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={interest.goal}
                            onChange={(e) => handleInterestEdit(index, "goal", e.target.checked)}
                            disabled={!isEditing}
                            className="form-checkbox h-5 w-5 text-blue-500"
                          />
                          <span className="text-sm text-gray-400">Goal</span>
                        </label>
                        {isEditing && (
                          <button
                            onClick={() => handleRemoveInterest(index)}
                            className="text-red-500 hover:text-red-600"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {isEditing && (
  <div className="flex mt-2">
    <input
      type="text"
      value={newInterest}
      onChange={(e) => setNewInterest(e.target.value)}
      className="flex-1 bg-gray-900 rounded px-2 py-1 border-white"
      placeholder="Add new interest"
    />
    <label className="flex items-center mx-2 space-x-2">
      <input
        type="checkbox"
        checked={isGoal}
        onChange={(e) => setIsGoal(e.target.checked)}
        className="form-checkbox h-5 w-5 text-blue-500"
      />
      <span className="text-sm text-gray-400">Goal</span>
    </label>
    <button
      onClick={handleAddInterest}
      className="ml-2 bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 transition"
    >
      Add
    </button>
  </div>
)}
                </div>
              </div>

              <button
                onClick={() => {
                  if (isEditing) {
                    handleSaveProfile();
                  } else {
                    setIsEditing(true);
                  }
                }}
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