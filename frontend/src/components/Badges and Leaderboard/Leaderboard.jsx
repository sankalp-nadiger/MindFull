import React from 'react';
import { Trophy, Flame, Medal, Crown, Activity, TrendingUp, MapPin, Star, Users, Target } from 'lucide-react';
import Navbar from '../Navbar/Navbar';
import FloatingChatButton from '../ChatBot/FloatingChatButton';
// Enhanced dummy data with districts and current user
const dummyUsers = [
  { id: 1, username: 'CodeMaster', streak: 45, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', lastActive: '2 hours ago', district: 'Mysuru North', points: 1350 },
  { id: 2, username: 'DevNinja', streak: 42, avatar: 'https://images.unsplash.com/photo-1494790108755-2616b68e8a62?w=150&h=150&fit=crop&crop=face', lastActive: '1 hour ago', district: 'Mysuru South', points: 1260 },
  { id: 3, username: 'TechGuru', streak: 38, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', lastActive: '30 min ago', district: 'Mysuru Central', points: 1140 },
  { id: 4, username: 'You', streak: 35, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face', lastActive: 'now', district: 'Mysuru North', points: 1050, isCurrentUser: true },
  { id: 5, username: 'ByteWarrior', streak: 33, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', lastActive: '5 min ago', district: 'Mysuru South', points: 990 },
  { id: 6, username: 'PixelPro', streak: 31, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', lastActive: '15 min ago', district: 'Mysuru Central', points: 930 },
  { id: 7, username: 'CodeCrusher', streak: 29, avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=150&h=150&fit=crop&crop=face', lastActive: '1 hour ago', district: 'Mysuru North', points: 870 },
  { id: 8, username: 'AlgoAce', streak: 27, avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face', lastActive: '2 hours ago', district: 'Mysuru South', points: 810 },
  { id: 9, username: 'DataDriven', streak: 25, avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&h=150&fit=crop&crop=face', lastActive: '3 hours ago', district: 'Mysuru Central', points: 750 },
  { id: 10, username: 'StackStar', streak: 23, avatar: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=150&h=150&fit=crop&crop=face', lastActive: '4 hours ago', district: 'Mysuru North', points: 690 },
  { id: 11, username: 'LogicLord', streak: 21, avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face', lastActive: '5 hours ago', district: 'Mysuru South', points: 630 },
  { id: 12, username: 'SyntaxSage', streak: 19, avatar: 'https://images.unsplash.com/photo-1494790108755-2616b68e8a62?w=150&h=150&fit=crop&crop=face', lastActive: '6 hours ago', district: 'Mysuru Central', points: 570 }
];

function Leaderboard() {
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [activeTab, setActiveTab] = React.useState('districts');

  React.useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const rankedUsers = dummyUsers
          .sort((a, b) => b.points - a.points)
          .map((user, index) => ({
            ...user,
            rank: index + 1
          }));
        
        setUsers(rankedUsers);
      } catch (err) {
        setError('Failed to fetch leaderboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

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

  const getDistrictStats = () => {
    const districts = {};
    users.forEach(user => {
      if (!districts[user.district]) {
        districts[user.district] = {
          name: user.district,
          totalPoints: 0,
          userCount: 0,
          users: []
        };
      }
      districts[user.district].totalPoints += user.points;
      districts[user.district].userCount += 1;
      districts[user.district].users.push(user);
    });

    return Object.values(districts)
      .map(district => ({
        ...district,
        avgPoints: Math.round(district.totalPoints / district.userCount),
        users: district.users.sort((a, b) => b.points - a.points).slice(0, 5)
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints);
  };

  const getCurrentUser = () => users.find(user => user.isCurrentUser);
  const getTopUsers = () => users.slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-blue-950 to-black flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-white">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-blue-950 to-black flex items-center justify-center">
        <div className="text-center text-red-400">
          <p className="text-xl mb-2">Oops! Something went wrong</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const currentUser = getCurrentUser();
  const topUsers = getTopUsers();
  const districtStats = getDistrictStats();

  return (
    <>
    <div className="min-h-screen bg-gradient-to-b from-black via-blue-950 to-black overflow-hidden">
      <Navbar />
      <div className="max-w-6xl mx-auto p-4">
        {/* Current User & Top 5 Split Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Current User Progress Card - Left Side */}
          {currentUser && (
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.username}
                  className="w-16 h-16 rounded-full border-4 border-white shadow-lg"
                />
                <div>
                  <h2 className="text-2xl font-bold text-white">{currentUser.username}</h2>
                  <p className="text-blue-100">Rank #{currentUser.rank} • {currentUser.district}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-white">
                  <Flame className="w-6 h-6 text-orange-400" />
                  <span className="text-2xl font-bold">{currentUser.streak}</span>
                  <span className="text-sm">days streak</span>
                </div>
                <div className="flex items-center gap-2 text-blue-100">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className="font-semibold">{currentUser.points} pts</span>
                </div>
              </div>
              
              {/* Badges Section */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-blue-100 mb-2">🏆 Your Badges</h3>
                <div className="flex flex-wrap gap-2">
                  {currentUser.streak >= 30 && (
                    <div className="flex items-center gap-1 bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full text-xs">
                      <Flame className="w-3 h-3" />
                      Fire Streak
                    </div>
                  )}
                  {currentUser.points >= 1000 && (
                    <div className="flex items-center gap-1 bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full text-xs">
                      <Star className="w-3 h-3" />
                      High Achiever
                    </div>
                  )}
                  {currentUser.rank <= 5 && (
                    <div className="flex items-center gap-1 bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full text-xs">
                      <Crown className="w-3 h-3" />
                      Top Performer
                    </div>
                  )}
                  {currentUser.streak >= 7 && (
                    <div className="flex items-center gap-1 bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs">
                      <Target className="w-3 h-3" />
                      Weekly Warrior
                    </div>
                  )}
                  {currentUser.district === 'Mysuru North' && (
                    <div className="flex items-center gap-1 bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-xs">
                      <MapPin className="w-3 h-3" />
                      District Champion
                    </div>
                  )}
                </div>
              </div>
              {currentUser.rank > 1 && (
                <div className="space-y-3">
                  <div className="p-3 bg-white/10 rounded-lg">
                    <div className="flex items-center gap-2 text-white mb-2">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      <span className="text-sm">
                        {users[currentUser.rank - 2].points - currentUser.points} points to reach rank #{currentUser.rank - 1}
                      </span>
                    </div>
                    <div className="text-xs text-blue-200 bg-blue-600/20 p-2 rounded">
                      💡 <strong>Quick Tips:</strong> Complete daily challenges (+50 pts), maintain your streak (+10 pts/day), 
                      or help others in community (+25 pts per help)
                    </div>
                  </div>
                </div>
              )}
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
              {topUsers.map((user) => (
                <div
                  key={user.id}
                  className={`p-4 flex items-center gap-3 transition-all ${
                    user.isCurrentUser
                      ? 'bg-blue-900/30 border-l-4 border-blue-400'
                      : 'hover:bg-gray-750'
                  }`}
                >
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                    {user.rank <= 3 ? getRankIcon(user.rank) : <span className="text-gray-400 font-bold">#{user.rank}</span>}
                  </div>
                  
                  <div className="flex-shrink-0">
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-10 h-10 rounded-full border-2 border-gray-600"
                    />
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white text-sm">
                        {user.username}
                      </h3>
                      {user.isCurrentUser && (
                        <span className="px-2 py-1 bg-blue-600 text-xs font-bold text-white rounded">
                          YOU
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{user.district}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-gray-700 px-2 py-1 rounded">
                      <Flame className="w-3 h-3 text-orange-400" />
                      <span className="text-white font-bold text-xs">{user.streak}</span>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-3 h-3" />
                      <span className="font-semibold text-xs">{user.points}</span>
                    </div>
                  </div>
                </div>
              ))}
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
                      Avg: {district.avgPoints} pts/user
                    </div>
                    {index > 0 && (
                      <div className="text-red-400 text-xs">
                        -{districtStats[0].totalPoints - district.totalPoints} pts behind leader
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
                {district.users.map((user, userIndex) => (
                  <div
                    key={user.id}
                    className={`p-4 flex items-center gap-3 ${
                      user.isCurrentUser
                        ? 'bg-blue-900/30 border-l-4 border-blue-400'
                        : 'hover:bg-gray-750'
                    } transition-all`}
                  >
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                      <span className="text-gray-400 font-bold">#{userIndex + 1}</span>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-10 h-10 rounded-full border-2 border-gray-600"
                      />
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-white">{user.username}</h4>
                        {user.isCurrentUser && (
                          <span className="px-2 py-1 bg-blue-600 text-xs font-bold text-white rounded">
                            YOU
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">Global rank: #{user.rank}</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 bg-gray-700 px-3 py-1 rounded-full">
                        <Flame className="w-4 h-4 text-orange-400" />
                        <span className="text-white font-bold text-sm">{user.streak}</span>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Star className="w-4 h-4" />
                        <span className="font-semibold text-sm">{user.points}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    <FloatingChatButton />
    </>
  );
}

export default Leaderboard;
