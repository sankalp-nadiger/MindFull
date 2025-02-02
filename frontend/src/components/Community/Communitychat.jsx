import React, { useState } from 'react';
import axios from 'axios';

const CommunityChat = () => {
  const [userId, setUserId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [joined, setJoined] = useState(false);

  // Function to join the community room
  const joinRoom = async () => {
    if (!userId || !roomId) {
      alert('Please provide User ID and Room ID');
      return;
    }

    try {
      const response = await axios.post('/api/community/join', { userId, roomId });
      if (response.status === 200) {
        setJoined(true);
        console.log(response.data.message);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to join the room');
    }
  };

  // Function to send a message to the community room
  const sendMessage = async () => {
    if (!message) {
      alert('Message cannot be empty');
      return;
    }

    try {
      const response = await axios.post('/api/community/message', { userId, roomId, message });
      if (response.status === 200) {
        setMessages([...messages, { userId, message }]);
        setMessage('');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to send message');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-blue-950 to-black text-white p-6">
    <div className="max-w-4xl mx-auto my-10 p-6 bg-gradient-to-br from-indigo-800 to-purple-600 rounded-lg shadow-lg">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">Community Chat</h2>
      </div>
      <div className="flex flex-col space-y-4 mt-6">
        {!joined && (
          <>
            <input
              type="text"
              placeholder="Enter User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="p-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="text"
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="p-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={joinRoom}
              className="p-3 rounded-lg bg-red-600 text-white hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              Join Room
            </button>
          </>
        )}
        {joined && (
          <>
            <div className="bg-gray-900 p-4 rounded-lg space-y-4 max-h-[400px] overflow-y-auto">
              {messages.map((msg, index) => (
                <div key={index} className="bg-gray-800 p-3 rounded-md">
                  <strong className="text-purple-400">{msg.userId}:</strong> {msg.message}
                </div>
              ))}
            </div>
            <div className="flex mt-4">
              <input
                type="text"
                placeholder="Type your message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="p-3 rounded-lg bg-gray-800 text-white flex-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={sendMessage}
                className="p-3 ml-3 rounded-lg bg-purple-500 text-white hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
    </div>
  );
};

export default CommunityChat;
