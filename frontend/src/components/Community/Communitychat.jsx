import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Navbar from '../Navbar/Navbar';
import { MessageCircle, Users, Plus, Hash, Send, X, Shield, Heart, UserPlus, ChevronDown } from 'lucide-react';
import FloatingChatButton from "../ChatBot/FloatingChatButton";
import { useTranslation } from 'react-i18next';

const CommunityChat = () => {
  const { t } = useTranslation();
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
  const chatContainerRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [lastSeenMessageIndex, setLastSeenMessageIndex] = useState(0);
  const [newMessageCount, setNewMessageCount] = useState(0);
  
  const accessToken = sessionStorage.getItem('accessToken');

  // Helper function to format date for separators
  const formatDateSeparator = (date) => {
    const today = new Date();
    const messageDate = new Date(date);
    
    // Reset time to compare just dates
    today.setHours(0, 0, 0, 0);
    messageDate.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - messageDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    
    return messageDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper function to check if two dates are on different days
  const isDifferentDay = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.toDateString() !== d2.toDateString();
  };

  // Helper function to format time for messages
  const formatMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Check if user is scrolled to bottom
  const checkScrollPosition = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom && messages.length > 0);
      
      // Update last seen message and reset new message count when user scrolls to bottom
      if (isNearBottom) {
        setLastSeenMessageIndex(messages.length - 1);
        setNewMessageCount(0);
      }
    }
  };

  // Smooth scroll to bottom
  const scrollToBottom = (force = false) => {
    if (messagesEndRef.current) {
      const chatContainer = chatContainerRef.current;
      if (force || !showScrollButton) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        setShowScrollButton(false);
        setLastSeenMessageIndex(messages.length - 1);
        setNewMessageCount(0);
      }
    }
  };

  // Handle scroll events
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.addEventListener('scroll', checkScrollPosition);
      return () => chatContainer.removeEventListener('scroll', checkScrollPosition);
    }
  }, [messages.length]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_API_URL}/community/rooms`, {
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
      alert('You must be logged in to access the community.');
    }
  }, [accessToken]);

  // Monitor room messages
  useEffect(() => {
    let interval;
    if (joinedRoom) {
      const pollRoomStatus = async () => {
        try {
          const response = await axios.get(`${import.meta.env.VITE_BASE_API_URL}/community/rooms`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          
          const currentRoomData = response.data.rooms.find(room => room._id === joinedRoom);
          
          if (currentRoomData && currentRoomData.messages) {
            setMessages(prev => {
              if (JSON.stringify(prev) !== JSON.stringify(currentRoomData.messages)) {
                // Calculate new messages if user is not at bottom
                if (showScrollButton && prev.length > 0) {
                  // Fix: Only count truly unread messages
                  const unread = currentRoomData.messages.length - 1 - lastSeenMessageIndex;
                  if (unread > 0) {
                    setNewMessageCount(unread);
                  }
                }
                return currentRoomData.messages;
              }
              return prev;
            });
          }
        } catch (error) {
          console.error('Error fetching room status:', error);
        }
      };

      pollRoomStatus();
      interval = setInterval(pollRoomStatus, 2000);
    }
    return () => clearInterval(interval);
  }, [joinedRoom, accessToken, showScrollButton, lastSeenMessageIndex]);

  // Fix chat container scroll and horizontal overflow
  useEffect(() => {
    if (messages.length > 0) {
      if (chatContainerRef.current && messagesEndRef.current) {
        const chatContainer = chatContainerRef.current;
        // Only scroll if user was at bottom before
        const { scrollTop, clientHeight, scrollHeight } = chatContainer;
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
        // Prevent sudden jump: only scroll if at bottom and not user scrolling up
        if (isAtBottom && !showScrollButton) {
          messagesEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end', inline: 'nearest' });
        }
      }
    }
  }, [messages]);

  const joinRoom = async (roomId) => {
    try {
      let response;
      response = await axios.post(
        `${import.meta.env.VITE_BASE_API_URL}/community/join`,
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
      
      response = await axios.get(`${import.meta.env.VITE_BASE_API_URL}/community/rooms`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setUsername(response.data.senderUsername)
      const currentRoomData = response.data.rooms.find(r => r._id === roomId);
      if (currentRoomData && currentRoomData.messages) {
        setMessages(currentRoomData.messages);
        setLastSeenMessageIndex(currentRoomData.messages.length - 1);
        setNewMessageCount(0);
      }
    } catch (error) {
      console.error('Error joining room:', error);
      alert('Failed to join the room. Please try again.');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!joinedRoom || !message.trim()) return;

    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_API_URL}/community/message`,
        {
          roomId: joinedRoom,
          message: message.trim(),
          username: senderUsername || localStorage.getItem('username') || 'Anonymous',
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setMessage('');
      // Do not scroll chat container or page after sending message
      const response = await axios.get(`${import.meta.env.VITE_BASE_API_URL}/community/rooms`, {
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
      alert('Failed to send message. Please try again.');
    }
  };

  const createRoom = async () => {
    if (!newRoomName.trim() || !newRoomDescription.trim()) {
      alert('Please fill in both room name and description.');
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_API_URL}/community/create`,
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
      
      const roomsResponse = await axios.get(`${import.meta.env.VITE_BASE_API_URL}/community/rooms`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setRooms(roomsResponse.data.rooms);
      
      setShowCreateRoomModal(false);
      setNewRoomName('');
      setNewRoomDescription('');
      
      if (response.data.room._id) {
        await joinRoom(response.data.room._id);
      }
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create the room. Please try again.');
    }
  };

  const getRoomIcon = (roomName) => {
    const name = roomName.toLowerCase();
    if (name.includes('anxiety') || name.includes('stress')) return '🧘';
    if (name.includes('depression') || name.includes('mood')) return '💙';
    if (name.includes('support') || name.includes('help')) return '🤝';
    if (name.includes('general') || name.includes('chat')) return '💬';
    if (name.includes('group') || name.includes('community')) return '👥';
    return '🌟';
  };

  return (
    <>
    <style>
        {`
          body, html {
            overflow-x: hidden !important;
            max-width: 100vw !important;
          }
        `}
      </style>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-x-hidden w-full">
        {/* Fixed watermark logo - always centered and visible */}
      <div 
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-center bg-no-repeat bg-contain opacity-[0.06] pointer-events-none z-0"
        style={{
          backgroundImage: `url('1a.png')`,
        }}
      />
        <div className="max-w-7xl mx-auto px-4 py-8 overflow-x-hidden">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full">
                <MessageCircle size={32} className="text-white" />
              </div>              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                {t('community.title')}
              </h1>
            </div>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              {t('community.description')}
            </p>
            

            {/* Trust Indicators */}
            <div className="mt-6 flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-green-400" />
                <span>{t('community.safeModerated')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart size={16} className="text-red-400" />
                <span>{t('community.mentalHealthFocused')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} className="text-blue-400" />
                <span>{t('community.supportive')}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {!joinedRoom && (
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <button
                onClick={() => setShowCreateRoomModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus size={20} />
                Create Support Room
              </button>
              <button
                onClick={() => setShowJoinRoomModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <UserPlus size={20} />
                Join with Room ID
              </button>
            </div>
          )}

          {/* Room List */}
          {!joinedRoom && !loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-hidden w-full max-w-full">
              {rooms.map((room) => (
                <div 
                  key={room._id} 
                  className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 hover:border-purple-500 transition-all duration-300 shadow-lg hover:shadow-purple-500/20 overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-3xl">{getRoomIcon(room.name)}</div>
                    <div className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                      {room.messages?.length || 0} messages
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mb-2 break-words overflow-hidden">
                    {room.name}
                  </h3>
                  
                  <p className="text-gray-300 text-sm mb-4 leading-relaxed break-words overflow-hidden">
                    {room.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-4 overflow-hidden">
                    <div className="flex items-center gap-1 min-w-0 overflow-hidden">
                      <Hash size={12} className="flex-shrink-0" />
                      <span className="font-mono truncate">{room._id.slice(-8)}</span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Users size={12} />
                      <span>Active now</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => joinRoom(room._id)}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                  >
                    Join Conversation
                  </button>
                </div>
              ))}
              
              {rooms.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <MessageCircle size={48} className="mx-auto text-gray-500 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">No rooms available</h3>
                  <p className="text-gray-500">Be the first to create a support room for the community!</p>
                </div>
              )}
            </div>
          )}

          {/* Chat Interface */}
          {joinedRoom && currentRoom && (
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-purple-800 to-blue-800 p-6 border-b border-gray-700">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4 min-w-0 flex-1 overflow-hidden">
                    <div className="text-2xl flex-shrink-0">{getRoomIcon(currentRoom.name)}</div>
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <h3 className="text-xl font-semibold text-white truncate">{currentRoom.name}</h3>
                      <p className="text-gray-200 text-sm truncate">{currentRoom.description}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-300 overflow-hidden max-w-full">
  <Hash size={12} className="flex-shrink-0" />
  <span className="truncate min-w-0">Room ID: {currentRoom._id.slice(-8)}</span>
</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setJoinedRoom(null);
                      setCurrentRoom(null);
                      setMessages([]);
                      setShowScrollButton(false);
                      setNewMessageCount(0);
                      setLastSeenMessageIndex(0);
                    }}
                    className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200 flex-shrink-0"
                    title="Leave room"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Messages Container */}
 <div className="relative">
  <div 
  ref={chatContainerRef} 
  className="h-96 lg:h-[500px] overflow-y-auto overflow-x-hidden p-6 bg-gradient-to-b from-gray-900 to-slate-900 scroll-smooth w-full"
>


{messages?.length === 0 ? (
  <div className="text-center py-12">
    <MessageCircle size={48} className="mx-auto text-gray-500 mb-4" />
    <h4 className="text-lg font-semibold text-gray-400 mb-2">Start the conversation</h4>
    <p className="text-gray-500">Be the first to share your thoughts and connect with others.</p>
  </div>
) : (
  messages?.map((msg, idx) => {
    // Fix: Compare msg.sender (which contains username) with current user's senderUsername
    const isCurrentUser = msg.sender && senderUsername && 
      msg.sender.toString() === senderUsername.toString();
    
    // Check if we need to show a date separator
    const showDateSeparator = idx === 0 || 
      (idx > 0 && isDifferentDay(messages[idx - 1].timestamp, msg.timestamp));

    return (
      <React.Fragment key={idx}>
        
        {/* Date Separator */}
        {showDateSeparator && (
          <div className="flex justify-center mb-6 mt-4">
            <div className="bg-gray-800 border border-gray-600 rounded-full px-4 py-2 text-xs text-gray-300 font-medium shadow-md">
              {formatDateSeparator(msg.timestamp)}
            </div>
          </div>
        )}
        
        {/* Message */}
        <div className={`flex w-full mb-4 ${isCurrentUser ? "justify-end" : "justify-start"} min-w-0 overflow-hidden`}>
          <div
            className={`relative p-4 max-w-[85%] sm:max-w-[75%] rounded-2xl shadow-lg overflow-hidden ${
              isCurrentUser 
                ? "bg-gradient-to-r from-green-600 to-green-700 text-white rounded-br-sm" 
                : "bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-bl-sm border border-gray-600"
            }`}
            style={{
              overflowWrap: 'break-word',
              wordBreak: 'break-word',
              minWidth: 0,
              maxWidth: '100%'
            }}
          >   
            {/* Message Header */}
            <div className="flex items-start justify-between mb-2 gap-3">
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className={`text-sm font-semibold truncate ${
                  isCurrentUser ? "text-green-100" : "text-gray-200"
                }`}>
                  {isCurrentUser ? "You" : (msg.sender || "Anonymous")}
                </p>
              </div>
              <div className="flex-shrink-0">
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  isCurrentUser 
                    ? "bg-green-800/30 text-green-200" 
                    : "bg-gray-600/30 text-gray-300"
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
                  {formatMessageTime(msg.timestamp)}
                </div>
              </div>
            </div>
            
            {/* Message Content */}
            <p className="text-sm leading-relaxed">{msg.message}</p>
            
            {/* Message Tail */}
            <div className={`absolute bottom-0 w-0 h-0 ${
              isCurrentUser 
                ? "right-0 border-l-[12px] border-l-green-700 border-t-[12px] border-t-transparent"
                : "left-0 border-r-[12px] border-r-gray-800 border-t-[12px] border-t-transparent"
            }`} style={{ 
              transform: 'translateY(1px)',
              maxWidth: '12px',
              overflow: 'hidden'
            }}></div>
          </div>
        </div>
      </React.Fragment>
    );
  })
)}
    <div ref={messagesEndRef} />
  </div>

                {/* Scroll to Bottom Button - Now centered */}
                {showScrollButton && (
                  <div className="absolute left-1/2 z-10" style={{ bottom: '1.5rem', transform: 'translateX(-50%)', pointerEvents: 'none', maxWidth: 'calc(100% - 2rem)' }}>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        if (chatContainerRef.current && messagesEndRef.current) {
                          const chatContainer = chatContainerRef.current;
                          const end = messagesEndRef.current;
                          // Calculate the offset needed to bring the last message into view
                          const offset = end.offsetTop - chatContainer.offsetTop - chatContainer.clientHeight + end.clientHeight + 16; // 16px padding
                          chatContainer.scrollTo({ top: offset, behavior: 'auto' });
                        }
                      }}
                      className="relative p-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 animate-bounce"
                      title="Scroll to latest message"
                      style={{ pointerEvents: 'auto' }}
                    >
                      <ChevronDown size={20} className="text-white" />
                      {/* New Message Count Badge */}
                      {newMessageCount > 0 && (
                        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 shadow-lg animate-pulse">
                          {newMessageCount > 99 ? '99+' : newMessageCount}
                        </div>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="p-6 bg-gradient-to-r from-gray-800 to-gray-900 border-t border-gray-700">
                <form onSubmit={sendMessage} className="flex gap-3 w-full max-w-full overflow-hidden">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="flex-1 p-4 rounded-xl bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 overflow-hidden"
                    maxLength={500}
                  />
                  <button
                    type="submit"
                    disabled={!message.trim()}
                    className="px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex-shrink-0"
                  >
                    <Send size={20} />
                  </button>
                </form>
                <div className="mt-2 text-xs text-gray-400 text-center">
                  Remember to be kind and supportive. This is a safe space for everyone.
                </div>
              </div>
            </div>
          )}

          {/* Create Room Modal */}
          {showCreateRoomModal && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 overflow-y-auto">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-md mx-auto my-8 overflow-hidden">
                <div className="p-6 border-b border-gray-700">
                  <h3 className="text-2xl font-bold text-white">Create Support Room</h3>
                  <p className="text-gray-400 text-sm mt-1">Create a safe space for meaningful conversations</p>
                </div>
                
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Room Name</label>
                    <input
                      type="text"
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      placeholder="e.g., Anxiety Support Group"
                      className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent overflow-hidden"
                      maxLength={50}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <textarea
                      value={newRoomDescription}
                      onChange={(e) => setNewRoomDescription(e.target.value)}
                      placeholder="Describe the purpose and guidelines for this room..."
                      className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent h-24 resize-none overflow-hidden"
                      maxLength={200}
                    />
                  </div>
                </div>
                
                <div className="p-6 border-t border-gray-700 flex gap-3">
                  <button
                    onClick={() => {
                      setShowCreateRoomModal(false);
                      setNewRoomName('');
                      setNewRoomDescription('');
                    }}
                    className="flex-1 p-3 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createRoom}
                    disabled={!newRoomName.trim() || !newRoomDescription.trim()}
                    className="flex-1 p-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg transition-all duration-200"
                  >
                    Create Room
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Join Room Modal */}
          {showJoinRoomModal && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 overflow-y-auto">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-md mx-auto my-8 overflow-hidden">
                <div className="p-6 border-b border-gray-700">
                  <h3 className="text-2xl font-bold text-white">Join Room</h3>
                  <p className="text-gray-400 text-sm mt-1">Enter the room ID to join a specific conversation</p>
                </div>
                
                <div className="p-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Room ID</label>
                  <input
                    type="text"
                    value={roomIdToJoin}
                    onChange={(e) => setRoomIdToJoin(e.target.value)}
                    placeholder="Enter the room ID..."
                    className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
                  />
                </div>
                
                <div className="p-6 border-t border-gray-700 flex gap-3">
                  <button
                    onClick={() => {
                      setShowJoinRoomModal(false);
                      setRoomIdToJoin('');
                    }}
                    className="flex-1 p-3 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => joinRoom(roomIdToJoin)}
                    disabled={!roomIdToJoin.trim()}
                    className="flex-1 p-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg transition-all duration-200"
                  >
                    Join Room
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <FloatingChatButton />
    </>
  );
};

export default CommunityChat;
