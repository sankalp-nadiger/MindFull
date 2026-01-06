import React, { useState, useEffect } from 'react';
import { Trophy, Target, Calendar, TrendingUp, Star, Medal, Award } from 'lucide-react';

const Scoreboard = () => {
  const [userScores, setUserScores] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const BACKEND_URL = import.meta.env.VITE_BASE_URL;
  useEffect(() => {
    fetchUserScores();
  }, []);

  const fetchUserScores = async () => {
    try {
      setLoading(true);
      
      // Try both token storage methods
      const token = localStorage.getItem('token') || 
                   localStorage.getItem('authToken') || 
                   sessionStorage.getItem('accessToken');
      
      console.log('🔑 Token found:', !!token);
      
      if (!token) {
        setError('Please log in to view your scores');
        return;
      }
      
      const response = await fetch(`${BACKEND_URL}/api/scores/user`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      console.log('📊 Response status:', response.status);
      
      if (response.status === 401) {
        setError('Your session has expired. Please log in again.');
        localStorage.removeItem('token');
        sessionStorage.removeItem('accessToken');
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch scores: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Received data:', data);
      setUserScores(data.data);
    } catch (err) {
      console.error('❌ Error fetching scores:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScorePercentage = (score, total) => {
    return ((score / total) * 100).toFixed(1);
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-amber-600" />;
      default: return <Star className="w-6 h-6 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your scores...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            Error: {error}
          </div>
          <button 
            onClick={() => window.location.href = '/login'}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-poppins bg-gradient-to-b from-indigo-950 via-blue-950 to-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="w-8 h-8 text-yellow-500 mr-2" />
            <h1 className="text-4xl font-bold text-gray-50">Your Scoreboard</h1>
          </div>
          <p className="text-gray-300">Track your gaming achievements and progress</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className=" rounded-xl shadow-lg p-6 border-l-8 border-2 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">Total Score</p>
                <p className="text-2xl font-bold text-blue-100">{userScores?.user?.totalScore || 0}</p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className=" rounded-xl shadow-lg p-6 border-l-8 border-2 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">Games Played</p>
                <p className="text-2xl font-bold text-green-100">{userScores?.statistics?.totalGamesPlayed || 0}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className=" rounded-xl shadow-lg p-6 border-l-8 border-2 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">Average Score</p>
                <p className="text-2xl font-bold text-purple-100">{userScores?.statistics?.averageScore || 0}/10</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className=" rounded-xl shadow-lg p-6 border-l-8 border-2 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">Best Score</p>
                <p className="text-2xl font-bold text-yellow-100">{userScores?.statistics?.bestScore?.toFixed(1) || 0}/10</p>
              </div>
              <Trophy className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Game History */}
        <div className="bg-gray-100  rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Recent Games
            </h2>
          </div>

          {userScores?.gameHistory?.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {userScores.gameHistory.map((game, index) => {
                const percentage = getScorePercentage(game.score, game.totalQuestions);
                return (
                  <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {getRankIcon(index + 1)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{game.gameName}</h3>
                          <p className="text-sm text-gray-500">{formatDate(game.playedAt)}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-800">{game.score}/{game.totalQuestions}</p>
                            <p className="text-sm text-gray-500">points</p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(percentage)}`}>
                            {percentage}%
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No games played yet</h3>
              <p className="text-gray-500">Start playing to see your scores here!</p>
              <button 
                className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                onClick={() => window.location.href = '/quiz'}
              >
                Play Now
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => window.location.href = '/mainpage'}
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold"
          >
            Play Another Game
          </button>
          <button 
            onClick={fetchUserScores}
            className="px-8 py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-semibold"
          >
            Refresh Scores
          </button>
        </div>
      </div>
    </div>
  );
};

export default Scoreboard;