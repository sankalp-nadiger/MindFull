import React, { useState, useEffect } from 'react';
import { Trophy, Flame, Medal, Crown, Activity, TrendingUp, MapPin, Star, Users, Target, AlertCircle, RefreshCw } from 'lucide-react';
import Navbar from '../Navbar/Navbar';
import FloatingChatButton from '../ChatBot/FloatingChatButton';

// API service functions
const API_BASE_URL = import.meta.env.VITE_BASE_API_URL;

const leaderboardAPI = {
  getTopPerformers: async () => {
    const response = await fetch(`${API_BASE_URL}/leaderboard/top-performers?limit=5`);
    if (!response.ok) throw new Error('Failed to fetch top performers');
    return response.json();
  },

  getUserPosition: async () => {
  try {
    const accessToken = sessionStorage.getItem('accessToken'); // Get token from sessionStorage
    
    const response = await fetch(`${API_BASE_URL}/leaderboard/my-position`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}` // Send as Authorization header
        }
        // Remove credentials: 'include' since you're using sessionStorage
    });
    
    if (response.status === 401 || response.status === 403) {
      return null; // User not authenticated
    }
    
    if (!response.ok) {
      throw new Error('Failed to fetch user position');
    }
    
    return response.json();
  } catch (error) {
    console.log('User position fetch error:', error.message);
    return null;
  }
},

  getDistrictStats: async () => {
    const response = await fetch(`${API_BASE_URL}/leaderboard/districts/stats`);
    if (!response.ok) throw new Error('Failed to fetch district stats');
    return response.json();
  },

  getGlobalLeaderboard: async (limit = 50) => {
    const response = await fetch(`${API_BASE_URL}/leaderboard/global?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch global leaderboard');
    return response.json();
  }
};

function Leaderboard() {
  const [topUsers, setTopUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [districtStats, setDistrictStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchLeaderboardData = async () => {
    try {
      setError(null);
      
      // Fetch all data concurrently
      const [topPerformersRes, userPositionRes, districtStatsRes] = await Promise.allSettled([
        leaderboardAPI.getTopPerformers(),
        leaderboardAPI.getUserPosition(),
        leaderboardAPI.getDistrictStats()
      ]);

      // Handle top performers
      if (topPerformersRes.status === 'fulfilled') {
        setTopUsers(topPerformersRes.value.data || []);
      } else {
        console.error('Failed to fetch top performers:', topPerformersRes.reason);
        setError('Failed to fetch some leaderboard data');
      }

      // Handle user position (might fail if not authenticated)
if (userPositionRes.status === 'fulfilled' && userPositionRes.value) {
  setCurrentUser(userPositionRes.value.data);
  setIsAuthenticated(true);
} else {
  setCurrentUser(null);
  setIsAuthenticated(false);
}

      // Handle district stats
      if (districtStatsRes.status === 'fulfilled') {
        setDistrictStats(districtStatsRes.value.data || []);
      } else {
        console.error('Failed to fetch district stats:', districtStatsRes.reason);
        if (!error) setError('Failed to fetch district statistics');
      }

    } catch (err) {
      console.error('Error fetching leaderboard data:', err);
      setError('Failed to fetch leaderboard data. Please try again.');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchLeaderboardData();
      setLoading(false);
    };
    
    loadData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLeaderboardData();
    setRefreshing(false);
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-gray-400 font-bold">#{rank}</span>;
    }
  };

const renderBadges = (badges) => {
  // If no badges, generate default ones based on user data
  if (!badges || badges.length === 0) {
    if (!currentUser) return null;
    
    const defaultBadges = [];
    if (currentUser.maxStreak >= 30) {
      defaultBadges.push({ type: 'fire', name: 'Fire Streak', color: 'orange' });
    }
    if (currentUser.points >= 1000) {
      defaultBadges.push({ type: 'star', name: 'High Achiever', color: 'yellow' });
    }
    if (currentUser.maxStreak >= 7) {
      defaultBadges.push({ type: 'target', name: 'Weekly Warrior', color: 'green' });
    }
    if (currentUser.globalRank <= 5) {
      defaultBadges.push({ type: 'crown', name: 'Top Performer', color: 'purple' });
    }
    
    badges = defaultBadges;
  }
  
  if (badges.length === 0) return <p className="text-gray-400 text-xs">No badges earned yet</p>;
    
    const badgeIcons = {
      fire: <Flame className="w-3 h-3" />,
      star: <Star className="w-3 h-3" />,
      target: <Target className="w-3 h-3" />,
      crown: <Crown className="w-3 h-3" />
    };

    return (
      <div className="flex flex-wrap gap-2">
        {badges.map((badge, index) => (
          <div
            key={index}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
              badge.color === 'orange' ? 'bg-orange-500/20 text-orange-300' :
              badge.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-300' :
              badge.color === 'green' ? 'bg-green-500/20 text-green-300' :
              badge.color === 'purple' ? 'bg-purple-500/20 text-purple-300' :
              'bg-blue-500/20 text-blue-300'
            }`}
          >
            {badgeIcons[badge.type] || <Star className="w-3 h-3" />}
            {badge.name}
          </div>
        ))}
      </div>
    );
  };

  const getDefaultAvatar = (gender) => {
    const maleAvatars = [
      "https://tse2.mm.bing.net/th?id=OIP.Yj7V4oP9Noi8p77a8Oyd5QHaJA&pid=Api&P=0&h=180",
      "https://tse2.mm.bing.net/th?id=OIP.zxQil4x4JMZtZm-7tUNF1QHaH_&pid=Api&P=0&h=180",
      "https://tse3.mm.bing.net/th?id=OIP.CHiM-UEsM0jqElrYHEftiwHaHa&pid=Api&P=0&h=180",
      "https://tse2.mm.bing.net/th?id=OIP.2Be2070ayk9DYoV9xRXFEgHaHa&pid=Api&P=0&h=180"
    ];

    const femaleAvatars = [
      "https://tse3.mm.bing.net/th?id=OIP.GYuOR-Ox5UCX3-R_Qz49aQHaHa&pid=Api&P=0&h=180",
      "https://tse1.mm.bing.net/th?id=OIP.HJ_CpQ29Bd9OeU98QDMe-gHaHa&pid=Api&P=0&h=180",
      "https://tse3.mm.bing.net/th?id=OIP.KpNNDej-Xh6Njm4Xf-15BQHaHa&pid=Api&P=0&h=180",
      "https://tse1.mm.bing.net/th?id=OIP.opldioYHZSr8ja6_DlApqgHaHa&pid=Api&P=0&h=180"
    ];

    if (gender === 'Male') {
      return maleAvatars[Math.floor(Math.random() * maleAvatars.length)];
    } else if (gender === 'Female') {
      return femaleAvatars[Math.floor(Math.random() * femaleAvatars.length)];
    } else {
      // Random choice for 'Other' or undefined
      const allAvatars = [...maleAvatars, ...femaleAvatars];
      return allAvatars[Math.floor(Math.random() * allAvatars.length)];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-blue-950 to-black flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading leaderboard...</p>
          <p className="text-gray-400 text-sm mt-2">Fetching latest rankings...</p>
        </div>
      </div>
    );
  }

  if (error && topUsers.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-blue-950 to-black flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Unable to Load Leaderboard</h2>
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={handleRefresh} 
            className="flex items-center gap-2 mx-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Retrying...' : 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-black via-blue-950 to-black overflow-x-hidden">
        <Navbar />
        <div className="max-w-6xl mx-auto p-4">
          {/* Header with Refresh Button */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-400" />
              Leaderboard
            </h1>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {/* Error Banner (if error but data exists) */}
          {error && (topUsers.length > 0 || districtStats.length > 0) && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">Some data might be outdated. Last error: {error}</span>
              </div>
            </div>
          )}

          {/* Current User & Top 5 Split Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Current User Progress Card - Left Side */}
            {isAuthenticated && currentUser ? (
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={currentUser.avatar || getDefaultAvatar(currentUser.gender)}
                    alt={currentUser.username}
                    className="w-16 h-16 rounded-full border-4 border-white shadow-lg"
                    onError={(e) => {
                      e.target.src = getDefaultAvatar(currentUser.gender);
                    }}
                  />
                  <div>
                    <h2 className="text-2xl font-bold text-white">{currentUser.fullName || currentUser.username}</h2>
                    <p className="text-blue-100">
                      Global Rank #{currentUser.globalRank} 
                      {currentUser.district && ` • ${currentUser.district}`}
                      {currentUser.districtRank && ` (District #${currentUser.districtRank})`}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
  <div className="text-white">
    <div className="flex items-center gap-2 mb-1">
      <Flame className="w-6 h-6 text-orange-400" />
      <span className="text-2xl font-bold">{currentUser.currentStreak || currentUser.streak || 0}</span>
      <span className="text-sm">current streak</span>
    </div>
    <div className="text-md text-blue-200">
      Best: {currentUser.maxStreak} days
    </div>
  </div>
  <div className="flex items-center gap-2 text-blue-100">
    <Star className="w-5 h-5 text-yellow-400" />
    <span className="font-semibold">{currentUser.points} pts</span>
  </div>
</div>
                
                {/* Badges Section */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-blue-100 mb-2">🏆 Your Badges</h3>
                  {renderBadges(currentUser.badges)}
                </div>

                {/* Progress to next rank */}
                {currentUser && (
  <div className="p-3 bg-white/10 rounded-lg">
    <div className="flex items-center gap-2 text-white mb-2">
      <TrendingUp className="w-5 h-5 text-green-400" />
      <span className="text-sm">
        {currentUser.pointsToNextRank > 0 
          ? `${currentUser.pointsToNextRank} points to reach rank #${currentUser.globalRank - 1}`
          : "You're at the top! Keep your streak going!"
        }
      </span>
    </div>
    <div className="text-xs text-blue-200 bg-blue-600/20 p-2 rounded">
      💡 <strong>Quick Tips:</strong> Complete daily challenges, maintain your streak, 
      or help others in community to earn more points!
    </div>
  </div>
)}
              </div>
            ) : (
              <div className="bg-gradient-to-r from-gray-600 to-gray-700 rounded-2xl p-6 shadow-2xl">
                <div className="text-center text-white">
                  <Crown className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h2 className="text-xl font-bold mb-2">Join the Competition!</h2>
                  <p className="text-gray-300 mb-4">
                    Sign in to see your ranking and compete with others in your district.
                  </p>
                  <button 
                    onClick={() => window.location.href = '/login'}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            )}

            {/* Top 5 Performers - Right Side */}
            <div className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-purple-800 to-blue-800">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Crown className="w-6 h-6 text-yellow-400" />
                  Top 5 Performers
                </h2>
              </div>
              
              <div className="divide-y divide-gray-700">
                {topUsers.length > 0 ? (
                  topUsers.map((user) => (
                    <div
                      key={user._id}
                      className={`p-4 flex items-center gap-3 transition-all ${
                        currentUser && user._id === currentUser._id
                          ? 'bg-blue-900/30 border-l-4 border-blue-400'
                          : 'hover:bg-gray-750'
                      }`}
                    >
                      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                        {user.rank <= 3 ? getRankIcon(user.rank) : <span className="text-gray-400 font-bold">#{user.rank}</span>}
                      </div>
                      
                      <div className="flex-shrink-0">
                        <img
                          src={user.avatar || getDefaultAvatar(user.gender)}
                          alt={user.username}
                          className="w-10 h-10 rounded-full border-2 border-gray-600"
                          onError={(e) => {
                            e.target.src = getDefaultAvatar(user.gender);
                          }}
                        />
                      </div>
                      
                      <div className="flex-grow">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white text-sm">
                            {user.fullName || user.username}
                          </h3>
                          {currentUser && user._id === currentUser._id && (
                            <span className="px-2 py-1 bg-blue-600 text-xs font-bold text-white rounded">
                              YOU
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">{user.district || 'No district'}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
  <div className="flex items-center gap-1 bg-gray-700 px-2 py-1 rounded">
    <Flame className="w-3 h-3 text-orange-400" />
    <span className="text-white font-bold text-xs">{user.currentStreak || user.streak || 0}</span>
  </div>
  <div className="text-xs text-gray-400">
    Max: {user.maxStreak}
  </div>
  <div className="flex items-center gap-1 text-yellow-400">
    <Star className="w-3 h-3" />
    <span className="font-semibold text-xs">{user.points}</span>
  </div>
</div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No users found yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Tab - Only Districts */}
          <div className="flex justify-center mb-8">
            <div className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg">
              <MapPin className="w-5 h-5 inline mr-2" />
              Districts Leaderboard
            </div>
          </div>

          {/* Content - Districts Only */}
          <div className="space-y-6">
            {districtStats.length > 0 ? (
              <>
                {/* Top 3 Districts */}
                <div className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                  <div className="p-6 bg-gradient-to-r from-green-800 to-teal-800">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <MapPin className="w-7 h-7 text-green-400" />
                      Top 3 Districts
                    </h2>
                  </div>
                  
                  <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {districtStats.slice(0, 3).map((district, index) => (
                      <div
                        key={district.name}
                        className={`p-4 rounded-xl border-2 ${
                          index === 0
                            ? 'border-yellow-400 bg-yellow-400/10'
                            : index === 1
                            ? 'border-gray-300 bg-gray-300/10'
                            : 'border-amber-600 bg-amber-600/10'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          {getRankIcon(index + 1)}
                          <h3 className="font-bold text-white">{district.name}</h3>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-300">
                            <Users className="w-4 h-4" />
                            <span>{district.userCount} users</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <Target className="w-4 h-4" />
                            <span>{district.totalPoints} total points</span>
                          </div>
                          <div className="text-green-400 font-semibold">
                            Average: {Math.round(district.avgPoints)} points/user
                          </div>
                          {index > 0 && districtStats[0] && (
                            <div className="text-red-400 text-xs">
                              -{districtStats[0].totalPoints - district.totalPoints} points behind leader
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* District Breakdown */}
                {districtStats.map((district, districtIndex) => (
                  <div key={district.name} className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-4 bg-gradient-to-r from-gray-700 to-gray-600">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          <MapPin className="w-6 h-6 text-blue-400" />
                          {district.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-300">
                          <span>{district.userCount} users</span>
                          <span>{district.totalPoints} total points</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="divide-y divide-gray-700">
                      {district.topUsers && district.topUsers.length > 0 ? (
                        district.topUsers.map((user, userIndex) => (
                          <div
                            key={user._id || user.username || userIndex}
                            className={`p-4 flex items-center gap-3 ${
                              currentUser && user.username === currentUser.username
                                ? 'bg-blue-900/30 border-l-4 border-blue-400'
                                : 'hover:bg-gray-750'
                            } transition-all`}
                          >
                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                              <span className="text-gray-400 font-bold">#{userIndex + 1}</span>
                            </div>
                            
                            <div className="flex-shrink-0">
                              <img
                                src={user.avatar || getDefaultAvatar(user.gender)}
                                alt={user.username}
                                className="w-10 h-10 rounded-full border-2 border-gray-600"
                                onError={(e) => {
                                  e.target.src = getDefaultAvatar(user.gender);
                                }}
                              />
                            </div>
                            
                            <div className="flex-grow">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-white">{user.username}</h4>
                                {currentUser && user.username === currentUser.username && (
                                  <span className="px-2 py-1 bg-blue-600 text-xs font-bold text-white rounded">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400">
                                District rank: #{userIndex + 1} • {user.lastActive || 'Recently active'}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1 bg-gray-700 px-3 py-1 rounded-full">
                                <Flame className="w-4 h-4 text-orange-400" />
                                <span className="text-white font-bold text-sm">{user.maxStreak}</span>
                              </div>
                              <div className="flex items-center gap-1 text-yellow-400">
                                <Star className="w-4 h-4" />
                                <span className="font-semibold text-sm">{user.points}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-gray-400">
                          <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>No users found in this district yet.</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              /* Show message if no districts found */
              <div className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8 text-center text-gray-400">
                  <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No District Data Available</h3>
                  <p>District leaderboard will appear once users start adding their location information.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <FloatingChatButton />
    </>
  );
}

export default Leaderboard;