"use client";

import { useState, useEffect } from "react";
import { User, Users, Mail, Book, Edit2, Upload, Star, Plus } from "lucide-react";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";

export default function UserProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [image, setImage] = useState("profile.png");
  const [newInterest, setNewInterest] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const accessToken = sessionStorage.getItem("accessToken");

        if (!accessToken) {
          console.error("No access token found");
          return;
        }

        const response = await fetch("http://localhost:8000/api/users/current", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          const filteredData = { ...data.data };

          // Remove unwanted fields (including refreshToken)
          ["_id", "issues", "createdAt", "updatedAt", "__v", "events", "location", "refreshToken", "lastLoginDate", "parent", "avatar"].forEach(
            (field) => delete filteredData[field]
          );

          setUserDetails(filteredData);
          setImage(filteredData.profileImage || "profile.png");
        } else {
          console.error("Failed to fetch user profile");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  const handleEdit = (field, value) => {
    setUserDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddInterest = () => {
    if (newInterest.trim() === "") return;
    setUserDetails((prev) => ({
      ...prev,
      interests: [...(prev.interests || []), { name: newInterest, goal: false }],
    }));
    setNewInterest("");
  };

  const handleSaveProfile = async () => {
    if (!userDetails) return;

    const accessToken = sessionStorage.getItem("accessToken");

    if (!accessToken) {
      alert("Authentication required.");
      return;
    }

    const formData = new FormData();
    formData.append("fullName", userDetails.fullName);
    formData.append("email", userDetails.email);
    formData.append("interests", JSON.stringify(userDetails.interests || []));

    try {
      const response = await fetch("http://localhost:8000/api/users/update", {
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
            <div className="w-full md:w-1/3 bg-gray-950 p-6 flex flex-col items-center">
              <img src={image} className="w-40 h-40 rounded-full object-cover border-4 border-blue-500" />
            </div>
            <div className="w-full md:w-2/3 p-8">
              <h1 className="text-3xl font-bold mb-6 text-gradient bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-indigo-500">Profile</h1>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-400">Interests</label>
                  <select
                    multiple
                    value={userDetails.interests.map((interest) => interest.name)}
                    onChange={(e) =>
                      handleEdit(
                        "interests",
                        [...e.target.selectedOptions].map((option) => ({ name: option.value, goal: false }))
                      )
                    }
                    disabled={!isEditing}
                    className="w-full bg-gray-900 rounded px-2 py-1 focus:ring-blue-500 border-white"
                  >
                    {["Fitness", "Reading", "Coding", "Music", "Mental Health"].map((interest) => (
                      <option key={interest} value={interest}>{interest}</option>
                    ))}
                  </select>
                  <div className="flex mt-2">
                    <input
                      type="text"
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      className="bg-gray-900 rounded px-2 py-1 border-white w-full"
                      placeholder="Add new interest"
                    />
                    <button
                      onClick={handleAddInterest}
                      className="ml-2 bg-green-500 text-white p-2 rounded hover:bg-green-600 transition"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={() => (isEditing ? handleSaveProfile() : setIsEditing(true))}
                className="mt-8 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center transition transform hover:scale-105"
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
