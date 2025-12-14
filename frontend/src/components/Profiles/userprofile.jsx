"use client";

import { useState, useEffect, useCallback } from "react";
import { User, Users, Mail, Book, Edit2, Upload, Star, Heart, Shield, Clock, Target } from "lucide-react";
import { useTranslation } from "react-i18next";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import FloatingChatButton from "../ChatBot/FloatingChatButton";
import Toast from "../pages/Toast";

export default function UserProfile() {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [newInterest, setNewInterest] = useState("");
  const [isGoal, setIsGoal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "info" });

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchUserProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const accessToken = sessionStorage.getItem("accessToken");
      if (!accessToken) {
        console.error("No access token found");
        setIsLoading(false);
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
      } else {
        console.error("Failed to fetch user profile");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

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

      if (response.ok) {
        const updatedData = await response.json();
        // Update userDetails with new avatar URL instead of managing separate image state
        setUserDetails(prev => ({
          ...prev,
          avatar: updatedData.avatar || URL.createObjectURL(file)
        }));
      } else {
        throw new Error(t('userProfile.messages.avatarUpdateFailed'));
      }
    } catch (error) {
      console.error("Error updating avatar:", error);
      setToast({ message: t('userProfile.messages.avatarUpdateFailed'), type: "error" });
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
        setToast({ message: t('userProfile.messages.authRequired'), type: "error" });
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
        setToast({ message: t('userProfile.messages.interestAdded', 'Interest added successfully'), type: "success" });
      } else {
        setToast({ message: t('userProfile.messages.addInterestFailed'), type: "error" });
      }
    } catch (error) {
      console.error("Error adding interest:", error);
      setToast({ message: t('userProfile.messages.addInterestError'), type: "error" });
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
      setToast({ message: t('userProfile.messages.authRequired'), type: "error" });
      return;
    }

    // Prepare only the editable fields for update
    const updateData = {
      fullName: userDetails.fullName,
      email: userDetails.email,
      username: userDetails.username,
      age: userDetails.age,
      gender: userDetails.gender,
      phone_no: userDetails.phone_no,
      interests: userDetails.interests || [],
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/users/update`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        setToast({ message: t('userProfile.messages.profileUpdated'), type: "success" });
        setIsEditing(false);
        // Refresh profile data
        fetchUserProfile();
      } else {
        const errorData = await response.json();
        setToast({ message: t('userProfile.messages.updateFailed') + (errorData.message ? `: ${errorData.message}` : ''), type: "error" });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setToast({ message: t('userProfile.messages.updateError'), type: "error" });
    }
  };

  if (isLoading || !userDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-400">{t('userProfile.loadingProfile')}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-gray-900 to-black text-gray-100 overflow-x-hidden">
        <Navbar />
        <div className="max-w-6xl mx-auto p-4 sm:p-6">
          <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-emerald-800/30 to-teal-800/30 p-6 border-b border-gray-800">
              <h1 className="text-3xl font-bold text-white mb-2">{t('userProfile.pageTitle')}</h1>
              <p className="text-gray-300">{t('userProfile.pageSubtitle')}</p>
            </div>

            <div className="flex flex-col xl:flex-row min-h-0">
              {/* Profile Sidebar */}
              <div className="w-full xl:w-1/3 bg-gray-800/50 p-4 sm:p-6 lg:p-8 xl:border-r xl:border-gray-800 flex-shrink-0">
                <div className="text-center">
                  <div className="relative inline-block">
                    <img
                      src={userDetails.avatar || "profile.png"}
                      className="w-32 h-32 rounded-full object-cover border-4 border-emerald-500/50 shadow-lg"
                      alt="Profile"
                      onError={(e) => {
                        e.target.src = "profile.png";
                      }}
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
                      className="absolute bottom-0 right-0 bg-emerald-600 hover:bg-emerald-700 p-2 rounded-full transition-colors shadow-lg"
                    >
                      <Upload size={16} />
                    </button>
                  </div>
                  
                  <h2 className="mt-4 text-xl font-semibold text-white">
                    {userDetails.fullName}
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">{userDetails.email}</p>
                  
                  {/* Wellness Stats */}
                  <div className="mt-6 space-y-3">
                    <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">{t('userProfile.wellnessStats.wellnessGoals')}</span>
                        <span className="text-emerald-400 font-semibold">
                          {userDetails.interests?.filter(i => i.goal).length || 0}
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">{t('userProfile.wellnessStats.interests')}</span>
                        <span className="text-emerald-400 font-semibold">
                          {userDetails.interests?.length || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="w-full xl:w-2/3 p-4 sm:p-6 lg:p-8 min-w-0 flex-1">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-8">
                  <h3 className="text-xl sm:text-2xl font-semibold text-white">{t('userProfile.personalInformation')}</h3>
                  <button
                    onClick={() => {
                      if (isEditing) {
                        handleSaveProfile();
                      } else {
                        setIsEditing(true);
                      }
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 sm:px-6 rounded-lg flex items-center transition-all duration-200 shadow-lg hover:shadow-emerald-500/25 text-sm sm:text-base"
                  >
                    <Edit2 size={16} className="mr-2" />
                    {isEditing ? t('userProfile.saveChanges') : t('userProfile.editProfile')}
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Basic Information Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {Object.entries(userDetails).map(([field, value]) => {
                      const excludedFields = [
                        "interests", "journals", "_id", "avatar", "goals", "events", 
                        "location", "progress", "refreshToken", "createdAt", "updatedAt", 
                        "lastLoginDate", "issues", "parent", "__v", "sittingProgress",
                        "counselorProgress", "sessionProgress", "counsellorReviews",
                        "inSittingSeries", "sittingNotes", "gameScores"
                      ];
                      
                      if (excludedFields.includes(field)) return null;
                      
                      const protectedFields = ['parent_phone_no'];
                      const nonEditableFields = ['maxStreak', 'streak', 'totalScore'];
                      
                      const isProtected = protectedFields.includes(field);
                      const isNonEditable = nonEditableFields.includes(field);
                      const isReadOnly = isProtected || isNonEditable;
                      
                      // Format field labels
                      let fieldLabel;
                      if (field === 'parent_phone_no') {
                        fieldLabel = t('userProfile.fields.parent_phone_no', 'Parent Phone Number');
                      } else {
                        fieldLabel = t(`userProfile.fields.${field}`, field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1'));
                      }
                      
                      return (
                        <div key={field} className="space-y-2">
                          <label className="block text-sm font-medium text-gray-300">
                            {fieldLabel}
                            {isProtected && <span className="text-xs text-gray-500 ml-2">{t('userProfile.protected')}</span>}
                          </label>
                          <input
                            type="text"
                            value={value || ''}
                            onChange={(e) => handleEdit(field, e.target.value)}
                            disabled={!isEditing || isReadOnly}
                            className={`w-full bg-gray-800 border border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-white placeholder-gray-400 transition-all duration-200 text-sm sm:text-base ${
                              isEditing && !isReadOnly 
                                ? 'focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500' 
                                : 'cursor-default'
                            } ${isReadOnly ? 'opacity-60' : ''}`}
                            placeholder={`${t('userProfile.enterYour')} ${fieldLabel.toLowerCase()}`}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Game Scores Section */}
                  {userDetails.gameScores && userDetails.gameScores.length > 0 && (
                    <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
                      <div className="flex items-center space-x-2 mb-4">
                        <Star className="w-5 h-5 text-yellow-400" />
                        <h4 className="text-lg font-semibold text-white">{t('userProfile.gamePerformance.title')}</h4>
                      </div>
                      
                      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                        {userDetails.gameScores.slice(0, 5).map((game, index) => {
                          const date = new Date(game.playedAt);
                          const formattedDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
                          
                          return (
                            <div key={index} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="text-white font-semibold">{game.gameName}</h5>
                                <span className="text-emerald-400 text-sm">
                                  {formattedDate}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">{t('userProfile.gamePerformance.score')}: <span className="text-white font-medium">{game.score}/{game.totalQuestions}</span></span>
                                <span className="text-yellow-400 font-medium">
                                  {((game.score / game.totalQuestions) * 100).toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="mt-4 bg-emerald-900/20 border border-emerald-800/50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-emerald-300 text-sm font-medium">{t('userProfile.gamePerformance.totalScore')}</span>
                          <span className="text-emerald-400 text-lg font-bold">{userDetails.totalScore || 0}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Wellness Interests & Goals Section */}
                  <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
                    <div className="flex items-center space-x-2 mb-4">
                      <Target className="w-5 h-5 text-emerald-400" />
                      <h4 className="text-lg font-semibold text-white">{t('userProfile.wellnessInterests.title')}</h4>
                    </div>
                    
                    <div className="space-y-3">
                      {userDetails.interests?.map((interest, index) => (
                        <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                          <input
                            type="text"
                            value={interest.name}
                            onChange={(e) => handleInterestEdit(index, "name", e.target.value)}
                            disabled={!isEditing}
                            className="w-full sm:flex-1 bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                          />
                          <div className="flex items-center justify-between w-full sm:w-auto space-x-3">
                            <label className="flex items-center space-x-2 text-sm">
                              <input
                                type="checkbox"
                                checked={interest.goal}
                                onChange={(e) => handleInterestEdit(index, "goal", e.target.checked)}
                                disabled={!isEditing}
                                className="w-4 h-4 text-emerald-600 bg-gray-700 border-gray-600 rounded focus:ring-emerald-500"
                              />
                              <span className="text-gray-300">{t('userProfile.wellnessInterests.goal')}</span>
                            </label>
                            {isEditing && (
                              <button
                                onClick={() => handleRemoveInterest(index)}
                                className="text-red-400 hover:text-red-300 p-1 rounded transition-colors"
                              >
                                <span className="text-lg">×</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {isEditing && (
                      <div className="mt-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                        <input
                          type="text"
                          value={newInterest}
                          onChange={(e) => setNewInterest(e.target.value)}
                          className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                          placeholder={t('userProfile.wellnessInterests.addNew')}
                        />
                        <div className="flex items-center space-x-3">
                          <label className="flex items-center space-x-2 text-sm px-3">
                            <input
                              type="checkbox"
                              checked={isGoal}
                              onChange={(e) => setIsGoal(e.target.checked)}
                              className="w-4 h-4 text-emerald-600 bg-gray-700 border-gray-600 rounded focus:ring-emerald-500"
                            />
                            <span className="text-gray-300">{t('userProfile.wellnessInterests.goal')}</span>
                          </label>
                          <button
                            onClick={handleAddInterest}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm whitespace-nowrap"
                          >
                            {t('userProfile.wellnessInterests.add')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Privacy Notice */}
                <div className="mt-8 bg-emerald-900/20 border border-emerald-800/50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-emerald-400 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-emerald-200 mb-1">{t('userProfile.privacy.title')}</h5>
                      <p className="text-sm text-emerald-300/80">
                        {t('userProfile.privacy.message')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Toast Notification */}
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: "", type: "info" })}
        />
      )}
      {/* Floating Chat Button */}
      <FloatingChatButton />
      <Footer />
    </>
  );
}
