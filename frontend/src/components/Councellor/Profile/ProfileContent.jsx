import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Save, Edit } from 'lucide-react';
import axios from 'axios';

const ProfileContent = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_API_URL}/counsellor/profile`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
            },
          }
        );
        setProfile(response.data.counselor);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setIsEditing(false);
    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_API_URL}/counsellor/profile`,
        { updates: profile },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
          },
        }
      );
      // Optionally show a success message
    } catch (error) {
      console.error('Error saving profile:', error);
      // Optionally show an error message
    }
  };

  if (loading || !profile) {
    return <div className="p-8 text-center text-gray-500">Loading profile...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Settings</h2>
            <p className="text-gray-600">Manage your professional information and preferences</p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Edit className="h-4 w-4" />
            <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
          </button>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-white text-gray-600 shadow-lg rounded-lg p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 ">
                Full Name
              </label>
              <input                
                type="text"
                value={profile.fullName || ''}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 ${isEditing ?'bg-slate-100 text-gray-700}':''} `}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={profile.email || ''}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 ${isEditing ?'bg-slate-100 text-gray-700}':''} `}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={profile.mobileNumber || ''}
                onChange={(e) => setProfile({ ...profile, mobileNumber: e.target.value })}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 ${isEditing ?'bg-slate-100 text-gray-700}':''} `}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specialization
              </label>
              <input
                type="text"
                value={profile.specification ? profile.specification.join(', ') : ''}
                onChange={(e) => setProfile({ ...profile, specification: e.target.value.split(',').map(s => s.trim()) })}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 ${isEditing ?'bg-slate-100 text-gray-700}':''} `}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience (Years)
              </label>
              <input
                type="number"
                value={profile.yearexp || ''}
                onChange={(e) => setProfile({ ...profile, yearexp: e.target.value })}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 ${isEditing ?'bg-slate-100 text-gray-700}':''} `}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={profile.location || ''}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 ${isEditing ?'bg-slate-100 text-gray-700}':''} `}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Credentials
              </label>
              <input
                type="text"
                value={profile.credentials || ''}
                onChange={(e) => setProfile({ ...profile, credentials: e.target.value })}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 ${isEditing ?'bg-slate-100 text-gray-700}':''} `}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Languages
              </label>
              <input
                type="text"
                value={profile.languages || ''}
                onChange={(e) => setProfile({ ...profile, languages: e.target.value })}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 ${isEditing ?'bg-slate-100 text-gray-700}':''} `}
              />
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Professional Bio
          </label>
          <textarea
            value={profile.bio || ''}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            disabled={!isEditing}
            rows={4}
           className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 ${isEditing ?'bg-slate-100 text-gray-700}':''} `}
          />
        </div>
        {/* Availability Section */}
<div className="mt-6">
  <h3 className="text-lg font-semibold text-gray-800 mb-3">Weekly Availability</h3>

  {profile.availability && profile.availability.length > 0 ? (
    profile.availability.map((daySlot, index) => (
      <div key={index} className="mb-4 border p-3 rounded-lg bg-gray-50">
        <label className="block font-medium text-gray-700 mb-1">{daySlot.day}</label>

        {daySlot.slots.map((slot, sIndex) => (
          <div key={sIndex} className="flex items-center gap-4 mb-2">
            <input
              type="time"
              value={slot.startTime}
              onChange={(e) => {
                const newAvailability = [...profile.availability];
                newAvailability[index].slots[sIndex].startTime = e.target.value;
                setProfile({ ...profile, availability: newAvailability });
              }}
              disabled={!isEditing}
              className={`border rounded-md px-2 py-1 ${!isEditing && 'bg-gray-100'}`}
            />
            <span>-</span>
            <input
              type="time"
              value={slot.endTime}
              onChange={(e) => {
                const newAvailability = [...profile.availability];
                newAvailability[index].slots[sIndex].endTime = e.target.value;
                setProfile({ ...profile, availability: newAvailability });
              }}
              disabled={!isEditing}
              className={`border rounded-md px-2 py-1 ${!isEditing && 'bg-gray-100'}`}
            />
          </div>
        ))}

        {isEditing && (
          <button
            onClick={() => {
              const newAvailability = [...profile.availability];
              newAvailability[index].slots.push({ startTime: '', endTime: '' });
              setProfile({ ...profile, availability: newAvailability });
            }}
            className="text-blue-600 text-sm mt-1"
          >
            + Add Slot
          </button>
        )}
      </div>
    ))
  ) : (
    <p className="text-gray-500">No availability set.</p>
  )}

  {isEditing && (
    <button
      onClick={() => {
        const newAvailability = [...(profile.availability || [])];
        newAvailability.push({ day: '', slots: [] });
        setProfile({ ...profile, availability: newAvailability });
      }}
      className="mt-2 text-blue-600 text-sm"
    >
      + Add Day
    </button>
  )}
</div>

        {/* Save Button */}
        {isEditing && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileContent;