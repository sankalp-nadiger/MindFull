import React from 'react';
import { Trophy, Flame, Medal, Crown, Activity } from 'lucide-react';
import { dummyUsers } from './data';
import Navbar from '../Navbar/Navbar';

function Leaderboard() {
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // Simulating API call with dummy data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Add rank to each user based on streak
        const rankedUsers = dummyUsers
          .sort((a, b) => b.streak - a.streak)
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
        return <Trophy className="w-6 h-6 text-blue-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-green-700 to-black flex items-center justify-center">
        <Activity className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-green-700 to-blackflex items-center justify-center text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-800 to-black p-8">
      <Navbar/>
      <div className="max-w-3xl mx-auto">
        <div className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-blue-900 to-purple-900">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-400" />
              Leaderboard
            </h1>
          </div>
          
          <div className="divide-y divide-gray-700">
            {users.map((user) => (
              <div
                key={user.id}
                className="p-4 flex items-center gap-4 hover:bg-gray-750 transition-colors"
              >
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                  {getRankIcon(user.rank)}
                </div>
                
                <div className="flex-shrink-0">
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-12 h-12 rounded-full border-2 border-gray-700"
                  />
                </div>
                
                <div className="flex-grow">
                  <h2 className="text-lg font-semibold text-white">
                    {user.username}
                  </h2>
                  <p className="text-sm text-gray-400">
                    Last active: {user.lastActive}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded-full">
                  <Flame className="w-5 h-5 text-orange-400" />
                  <span className="text-white font-bold">{user.streak}</span>
                  <span className="text-gray-300 text-sm">days</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;