import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const CommunityChat = () => {
  const [rooms, setRooms] = useState([]);
  const [joinedRoom, setJoinedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [showJoinRoomModal, setShowJoinRoomModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [roomIdToJoin, setRoomIdToJoin] = useState('');
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [senderUsername, setUsername] = useState('');
  const [currentRoom, setCurrentRoom] = useState(null);
  const messagesEndRef = useRef(null);
  const [userId, setUserId] = useState(null);
  
  const accessToken = sessionStorage.getItem('accessToken');
  //const userId = sessionStorage.getItem('userId');

  // Fetch rooms initially
  useEffect(() => {
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

    if (accessToken) {
      fetchRooms();
    } else {
      setLoading(false);
      alert('You must be logged in to access the rooms.');
    }
  }, [accessToken]);

  // Poll for new messages
  useEffect(() => {
    let interval;
    if (joinedRoom) {
      interval = setInterval(async () => {
        try {
          const response = await axios.get(`http://localhost:8000/api/community/rooms`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          const currentRoomData = response.data.rooms.find(room => room._id === joinedRoom);
          if (currentRoomData && currentRoomData.messages) {
            setMessages(currentRoomData.messages);
          }
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      }, 1000); // Poll every second
    }
    return () => clearInterval(interval);
  }, [joinedRoom, accessToken]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const joinRoom = async (roomId) => {
    try {
      let response;
      response= await axios.post(
        'http://localhost:8000/api/community/join',
        { roomId },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setUserId(response.data.userId);
        localStorage.setItem("userId", response.data.userId);
      const room = rooms.find(r => r._id === roomId);
      setCurrentRoom(room);
      setJoinedRoom(roomId);
      setShowJoinRoomModal(false);
      
      // Fetch initial messages
      response = await axios.get(`http://localhost:8000/api/community/rooms`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setUsername(response.data.senderUsername)
      const currentRoomData = response.data.rooms.find(r => r._id === roomId);
      if (currentRoomData && currentRoomData.messages) {
        setMessages(currentRoomData.messages);
        
      }
    } catch (error) {
      console.error('Error joining room:', error);
      alert('Failed to join the room');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!joinedRoom || !message.trim()) return;

    try {
      await axios.post(
        'http://localhost:8000/api/community/message',
        {
          roomId: joinedRoom,
          message: message.trim()
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Clear input after sending
      setMessage('');
      
      // Fetch updated messages
      const response = await axios.get(`http://localhost:8000/api/community/rooms`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const currentRoomData = response.data.rooms.find(room => room._id === joinedRoom);
      if (currentRoomData && currentRoomData.messages) {
        setMessages(currentRoomData.messages);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  const createRoom = async () => {
    try {
      const response = await axios.post(
        'http://localhost:8000/api/community/create',
        {
          roomName: newRoomName,
          description: newRoomDescription
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      
      // Fetch updated rooms list
      const roomsResponse = await axios.get('http://localhost:8000/api/community/rooms', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setRooms(roomsResponse.data.rooms);
      
      setShowCreateRoomModal(false);
      setNewRoomName('');
      setNewRoomDescription('');
      
      // Join the newly created room
      if (response.data.room._id) {
        await joinRoom(response.data.room._id);
      }
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create the room');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-blue-950 to-black text-white p-6">
      <div className="max-w-6xl mx-auto my-10 p-6 bg-gradient-to-br from-indigo-800 to-purple-600 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white">Community Chat</h2>
          {!joinedRoom && (
            <div className="mt-4 space-x-4">
              <button
                onClick={() => setShowCreateRoomModal(true)}
                className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Create a Room
              </button>
              <button
                onClick={() => setShowJoinRoomModal(true)}
                className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Join by ID
              </button>
            </div>
          )}
        </div>

        {/* Room list view */}
        {!joinedRoom && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <div key={room._id} className="bg-gray-800 p-4 rounded-lg">
                <div className="text-white">
                  <h3 className="text-xl font-bold">{room.name}</h3>
                  <p className="text-gray-300 mt-2">{room.description}</p>
                  <p className="text-gray-400 text-sm mt-2">Room ID: {room._id}</p>
                </div>
                <button
                  onClick={() => joinRoom(room._id)}
                  className="mt-4 w-full p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Join Room
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Chat room view */}
        {joinedRoom && currentRoom && (
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-bold">{currentRoom.name}</h3>
                <p className="text-gray-300">{currentRoom.description}</p>
                <p className="text-gray-400 text-sm">Room ID: {currentRoom._id}</p>
              </div>
              <button
                onClick={() => setJoinedRoom(null)}
                className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Leave Room
              </button>
            </div>
            
            <div className="bg-gray-800 rounded-lg h-96 overflow-auto p-4 mb-4">
  {messages?.map((msg, idx) => {
    const storedUserId = userId || localStorage.getItem("userId"); // Ensure userId is never null
    const isCurrentUser = msg.sender && storedUserId && msg.sender.toString() === storedUserId.toString();
    //console.log(senderUsername)

    return (
      <div key={idx} className={`flex w-full mb-2 ${isCurrentUser ? "justify-end" : "justify-start"}`}>
        <div
          className={`p-3 max-w-[70%] rounded-xl shadow-md ${
            isCurrentUser ? "bg-green-500 text-white rounded-br-none" : "bg-gray-200 text-black rounded-bl-none"
          }`}
        >
          <p className="text-xs font-medium mb-0.5 text-opacity-80">
            {isCurrentUser ? "You" : `${senderUsername}`}
          </p>
          <p className="text-sm">{msg.message}</p>
          <p className="text-[11px] text-opacity-80 text-right mt-0.5">
            {new Date(msg.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </p>
        </div>
      </div>
    );
  })}
  <div ref={messagesEndRef} />
</div>

            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 p-3 rounded-lg bg-gray-700 text-white"
              />
              <button
                type="submit"
                className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Send
              </button>
            </form>
          </div>
        )}

        {/* Create Room Modal */}
        {showCreateRoomModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
              <h3 className="text-2xl font-bold mb-4">Create a New Room</h3>
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="Enter room name"
                className="w-full p-3 mb-4 rounded-lg bg-gray-700 text-white"
              />
              <textarea
                value={newRoomDescription}
                onChange={(e) => setNewRoomDescription(e.target.value)}
                placeholder="Enter room description"
                className="w-full p-3 mb-4 rounded-lg bg-gray-700 text-white"
              />
              <div className="flex justify-between">
                <button
                  onClick={() => setShowCreateRoomModal(false)}
                  className="p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={createRoom}
                  className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Create Room
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Join Room Modal */}
        {showJoinRoomModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
              <h3 className="text-2xl font-bold mb-4">Join Room by ID</h3>
              <input
                type="text"
                value={roomIdToJoin}
                onChange={(e) => setRoomIdToJoin(e.target.value)}
                placeholder="Enter room ID"
                className="w-full p-3 mb-4 rounded-lg bg-gray-700 text-white"
              />
              <div className="flex justify-between">
                <button
                  onClick={() => setShowJoinRoomModal(false)}
                  className="p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => joinRoom(roomIdToJoin)}
                  className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Join Room
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityChat;