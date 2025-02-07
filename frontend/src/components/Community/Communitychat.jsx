import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CommunityChat = () => {
  const [rooms, setRooms] = useState([]);
  const [joinedRoom, setJoinedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const accessToken = sessionStorage.getItem('accessToken');
  const userId = sessionStorage.getItem('userId'); // Get the user ID from session storage

  useEffect(() => {
    // Fetch rooms from the backend
    const fetchRooms = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/community/rooms', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setRooms(response.data.rooms);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching rooms:', error);
        setLoading(false);
      }
    };

    // Fetch rooms if the user is logged in
    if (accessToken) {
      fetchRooms();
    } else {
      setLoading(false);
      alert('You must be logged in to access the rooms.');
    }
  }, [accessToken]);

  const joinRoom = async (roomId) => {
    try {
      const response = await axios.post(
        'http://localhost:8000/api/community/join',
        { roomId, userId }, // Use the actual userId
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setJoinedRoom(roomId);
      console.log(`Successfully joined room: ${roomId}`);
    } catch (error) {
      console.error('Error joining room:', error);
      alert('Failed to join the room');
    }
  };

  const sendMessage = async () => {
    if (!joinedRoom || !message.trim()) return;

    const messageData = { roomId: joinedRoom, userId, message }; // Send the actual userId

    try {
      // Send the message to the backend
      await axios.post(
        'http://localhost:8000/api/community/message',
        messageData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Add the message to the local state
      setMessages((prevMessages) => [...prevMessages, messageData]);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send the message');
    }
  };

  const createRoom = async () => {
    try {
      const response = await axios.post(
        'http://localhost:8000/api/community/create',
        { roomName: newRoomName, userId, description: newRoomDescription }, // Pass the userId dynamically
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setRooms((prevRooms) => [
        ...prevRooms,
        { name: newRoomName, _id: response.data.roomId, description: newRoomDescription },
      ]);
      setShowCreateRoomModal(false);
      setNewRoomName('');
      setNewRoomDescription('');
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create the room');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-blue-950 to-black text-white p-6">
      <div className="max-w-4xl mx-auto my-10 p-6 bg-gradient-to-br from-indigo-800 to-purple-600 rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Community Chat</h2>
        </div>

        <div className="flex flex-col space-y-4 mt-6">
          {loading ? (
            <p>Loading rooms...</p>
          ) : (
            <div className="space-y-4">
              {rooms.length === 0 ? (
                <div className="text-center">
                  <button
                    onClick={() => setShowCreateRoomModal(true)}
                    className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Create a Room
                  </button>
                </div>
              ) : (
                rooms.map((room, index) => (
                  <div key={index} className="bg-gray-800 p-4 rounded-lg flex justify-between items-center">
                    <div className="text-white">
                      <strong>{room.name}</strong>
                      <p>{room.description}</p>
                    </div>
                    <button
                      onClick={() => joinRoom(room._id)}
                      className="p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Join
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {joinedRoom && (
            <div className="mt-6 text-green-500">
              <p>You have successfully joined room {joinedRoom}!</p>
              <div className="mt-4 bg-gray-700 p-4 rounded-lg h-64 overflow-auto">
                {messages.map((msg, idx) => (
                  <div key={idx} className="text-white">
                    <strong>{msg.userId}: </strong>{msg.message}
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full p-2 border rounded-lg"
                />
                <button
                  onClick={sendMessage}
                  className="ml-2 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Room Modal */}
      {showCreateRoomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-2xl font-bold mb-4">Create a New Room</h3>
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Enter room name"
              className="w-full p-2 border rounded-lg mb-4"
            />
            <textarea
              value={newRoomDescription}
              onChange={(e) => setNewRoomDescription(e.target.value)}
              placeholder="Enter room description"
              className="w-full p-2 border rounded-lg mb-4"
            ></textarea>
            <div className="flex justify-between">
              <button
                onClick={() => setShowCreateRoomModal(false)}
                className="p-2 bg-gray-400 text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={createRoom}
                className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Create Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityChat;
