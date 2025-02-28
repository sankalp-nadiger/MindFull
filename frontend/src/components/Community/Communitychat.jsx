import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Navbar from '../Navbar/Navbar';
import { Video, X, Mic, MicOff, Camera, CameraOff, Maximize, Minimize } from 'lucide-react';

const CommunityChat = () => {
  const [rooms, setRooms] = useState([]);
  const [joinedRoom, setJoinedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [showJoinRoomModal, setShowJoinRoomModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
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
  
  // Video chat states
  const [stream, setStream] = useState(null);
  const [peerStreams, setPeerStreams] = useState([]);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeVideoRoom, setActiveVideoRoom] = useState(null);
  const [videoParticipants, setVideoParticipants] = useState([]);
  const localVideoRef = useRef(null);
  const peerConnections = useRef({});
  const videoModalRef = useRef(null);
  
  const accessToken = sessionStorage.getItem('accessToken');

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      const chatContainer = chatContainerRef.current;
      const isScrolledToBottom = chatContainer && 
        (chatContainer.scrollHeight - chatContainer.scrollTop <= chatContainer.clientHeight + 100);

      if (isScrolledToBottom) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }
  };

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
      alert('You must be logged in to access the rooms.');
    }
  }, [accessToken]);

  // Monitor active video chats in rooms
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
          
          // Check for messages
          if (currentRoomData && currentRoomData.messages) {
            setMessages(prev => {
              if (JSON.stringify(prev) !== JSON.stringify(currentRoomData.messages)) {
                return currentRoomData.messages;
              }
              return prev;
            });
          }
          
          // Check for active video chats
          if (currentRoomData && currentRoomData.activeVideoChat) {
            setActiveVideoRoom(currentRoomData.activeVideoChat);
            setVideoParticipants(currentRoomData.videoParticipants || []);
          } else {
            setActiveVideoRoom(null);
            setVideoParticipants([]);
          }
        } catch (error) {
          console.error('Error fetching room status:', error);
        }
      };

      pollRoomStatus();
      interval = setInterval(pollRoomStatus, 1000);
    }
    return () => clearInterval(interval);
  }, [joinedRoom, accessToken]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        document.fullscreenElement || 
        document.webkitFullscreenElement || 
        document.mozFullScreenElement || 
        document.msFullscreenElement
      );
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!videoModalRef.current) return;

    if (!isFullscreen) {
      if (videoModalRef.current.requestFullscreen) {
        videoModalRef.current.requestFullscreen();
      } else if (videoModalRef.current.webkitRequestFullscreen) {
        videoModalRef.current.webkitRequestFullscreen();
      } else if (videoModalRef.current.mozRequestFullScreen) {
        videoModalRef.current.mozRequestFullScreen();
      } else if (videoModalRef.current.msRequestFullscreen) {
        videoModalRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  // Setup user media when video modal is opened
  useEffect(() => {
    if (showVideoModal) {
      const setupMediaStream = async () => {
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: videoEnabled,
            audio: audioEnabled
          });
          
          setStream(mediaStream);
          
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = mediaStream;
          }
          
          // Notify server about starting/joining video chat
          await notifyVideoStatus(true);
          
          // Setup WebRTC connection
          setupWebRTC(mediaStream);
          
        } catch (error) {
          console.error('Error accessing camera and microphone:', error);
          alert('Failed to access camera and microphone');
        }
      };
      
      setupMediaStream();
    } else {
      // Close and cleanup media streams when modal is closed
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      
      // Close all peer connections
      Object.values(peerConnections.current).forEach(connection => {
        if (connection) {
          connection.close();
        }
      });
      
      // Notify server about leaving video chat
      if (joinedRoom) {
        notifyVideoStatus(false);
      }
      
      peerConnections.current = {};
      setPeerStreams([]);
    }
  }, [showVideoModal]);

  // Function to notify server about video chat status
  const notifyVideoStatus = async (isJoining) => {
    try {
      if (isJoining) {
        await axios.post(
          `${import.meta.env.VITE_BASE_API_URL}/community/video/join`,
          { 
            roomId: joinedRoom,
            userId: userId,
            username: senderUsername
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
      } else {
        await axios.post(
          `${import.meta.env.VITE_BASE_API_URL}/community/video/leave`,
          { 
            roomId: joinedRoom,
            userId: userId
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
      }
    } catch (error) {
      console.error('Error updating video status:', error);
    }
  };

  // Function to set up WebRTC connection
  const setupWebRTC = async (mediaStream) => {
    // This is a simplified example - you would need to implement a proper signaling mechanism
    try {
      // Create socket connection for signaling
      const socket = new WebSocket(`${import.meta.env.VITE_WS_URL}/videochat?roomId=${joinedRoom}&token=${accessToken}`);
      
      socket.onopen = () => {
        console.log('WebSocket connection established');
        socket.send(JSON.stringify({
          type: 'join',
          roomId: joinedRoom,
          userId: userId,
          username: senderUsername
        }));
      };
      
      socket.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'room-participants') {
          // Update the list of video participants
          setVideoParticipants(data.participants || []);
          
          // Connect to each existing participant
          data.participants.forEach(async (participant) => {
            if (participant.userId !== userId && !peerConnections.current[participant.userId]) {
              await initiateConnection(socket, participant.userId, mediaStream);
            }
          });
        }
        
        if (data.type === 'user-joined' && data.userId !== userId) {
          // Add the new participant to the list
          setVideoParticipants(prev => {
            if (!prev.some(p => p.userId === data.userId)) {
              return [...prev, { userId: data.userId, username: data.username }];
            }
            return prev;
          });
          
          // Create connection with the new participant
          await initiateConnection(socket, data.userId, mediaStream);
        }
        
        // Handle offers from other peers
        if (data.type === 'offer' && data.targetUserId === userId) {
          await handleOffer(socket, data, mediaStream);
        }
        
        // Handle answers from other peers
        if (data.type === 'answer' && data.targetUserId === userId) {
          const peerConnection = peerConnections.current[data.userId];
          if (peerConnection) {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
          }
        }
        
        // Handle ICE candidates from other peers
        if (data.type === 'ice-candidate' && data.targetUserId === userId) {
          const peerConnection = peerConnections.current[data.userId];
          if (peerConnection) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
          }
        }
        
        // Handle user disconnections
        if (data.type === 'user-left') {
          // Close the peer connection
          if (peerConnections.current[data.userId]) {
            peerConnections.current[data.userId].close();
            delete peerConnections.current[data.userId];
          }
          
          // Remove the stream from the list
          setPeerStreams(prev => prev.filter(item => item.id !== data.userId));
          
          // Remove from participants list
          setVideoParticipants(prev => prev.filter(p => p.userId !== data.userId));
        }
      };
      
      // Clean up on component unmount
      return () => {
        socket.close();
      };
    } catch (error) {
      console.error('Error setting up WebRTC:', error);
    }
  };

  // Function to initiate connection with a peer
  const initiateConnection = async (socket, peerId, mediaStream) => {
    // Create a new peer connection
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });
    
    peerConnections.current[peerId] = peerConnection;
    
    // Add local tracks to the peer connection
    mediaStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, mediaStream);
    });
    
    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.send(JSON.stringify({
          type: 'ice-candidate',
          candidate: event.candidate,
          targetUserId: peerId
        }));
      }
    };
    
    // Handle remote tracks
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setPeerStreams(prev => {
        // Check if we already have this stream
        if (!prev.some(stream => stream.id === peerId)) {
          return [...prev, { id: peerId, stream: remoteStream }];
        }
        return prev;
      });
    };
    
    // Create and send an offer
    const offer = await peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true
    });
    await peerConnection.setLocalDescription(offer);
    
    socket.send(JSON.stringify({
      type: 'offer',
      offer: peerConnection.localDescription,
      targetUserId: peerId
    }));
  };

  // Function to handle incoming offers
  const handleOffer = async (socket, data, mediaStream) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });
    
    peerConnections.current[data.userId] = peerConnection;
    
    // Add local tracks to the peer connection
    mediaStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, mediaStream);
    });
    
    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.send(JSON.stringify({
          type: 'ice-candidate',
          candidate: event.candidate,
          targetUserId: data.userId
        }));
      }
    };
    
    // Handle remote tracks
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setPeerStreams(prev => {
        if (!prev.some(stream => stream.id === data.userId)) {
          return [...prev, { id: data.userId, stream: remoteStream }];
        }
        return prev;
      });
    };
    
    // Set remote description
    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
    
    // Create and send an answer
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    
    socket.send(JSON.stringify({
      type: 'answer',
      answer: peerConnection.localDescription,
      targetUserId: data.userId
    }));
  };

  // Toggle video
  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !videoEnabled;
      });
      setVideoEnabled(!videoEnabled);
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !audioEnabled;
      });
      setAudioEnabled(!audioEnabled);
    }
  };

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
      }
      
      // Check if there's an active video chat
      if (currentRoomData && currentRoomData.activeVideoChat) {
        setActiveVideoRoom(currentRoomData.activeVideoChat);
        setVideoParticipants(currentRoomData.videoParticipants || []);
      }
    } catch (error) {
      console.error('Error joining room:', error);
      alert('Failed to join the room');
    }
  };

  const startOrJoinVideoChat = () => {
    setShowVideoModal(true);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!joinedRoom || !message.trim()) return;

    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_API_URL}/community/message`,
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

      setMessage('');
      
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
      alert('Failed to send message');
    }
  };

  const createRoom = async () => {
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
      alert('Failed to create the room');
    }
  };

  return (
    
      <><Navbar /><div className="min-h-screen bg-gradient-to-b from-black via-blue-950 to-black text-white p-6">
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

        {!joinedRoom && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <div key={room._id} className="bg-gray-800 p-4 rounded-lg">
                <div className="text-white">
                  <h3 className="text-xl font-bold">{room.name}</h3>
                  <p className="text-gray-300 mt-2">{room.description}</p>
                  <p className="text-gray-400 text-sm mt-2">Room ID: {room._id}</p>
                  {room.activeVideoChat && (
                    <div className="mt-2 flex items-center text-green-400">
                      <Video size={16} className="mr-1" />
                      <span>Active video chat ({room.videoParticipants?.length || 0} participants)</span>
                    </div>
                  )}
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

        {joinedRoom && currentRoom && (
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-bold">{currentRoom.name}</h3>
                <p className="text-gray-300">{currentRoom.description}</p>
                <p className="text-gray-400 text-sm">Room ID: {currentRoom._id}</p>
                {activeVideoRoom && videoParticipants.length > 0 && !showVideoModal && (
                  <div className="mt-2 flex items-center text-green-400">
                    <Video size={16} className="mr-1" />
                    <span>Active video chat ({videoParticipants.length} participants)</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={startOrJoinVideoChat}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Video size={18} className="mr-1" /> 
                  {activeVideoRoom ? 'Join Video Chat' : 'Start Video Chat'}
                </button>
                <button
                  onClick={() => setJoinedRoom(null)}
                  className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Leave Room
                </button>
              </div>
            </div>

            <div ref={chatContainerRef} className="bg-gray-800 rounded-lg h-96 overflow-auto p-4 mb-4">
              {messages?.map((msg, idx) => {
                const storedUserId = userId || localStorage.getItem("userId");
                const isCurrentUser = msg.sender && storedUserId && msg.sender.toString() === storedUserId.toString();

                return (
                  <div key={idx} className={`flex w-full mb-2 ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`p-3 max-w-[70%] rounded-xl shadow-md ${isCurrentUser ? "bg-green-500 text-white rounded-br-none" : "bg-gray-200 text-black rounded-bl-none"}`}
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
                className="flex-1 p-3 rounded-lg bg-gray-700 text-white" />
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
              <h3 className="text-2xl font-bold mb-4">Create a New Room</h3>
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="Enter room name"
                className="w-full p-3 mb-4 rounded-lg bg-gray-700 text-white" />
              <textarea
                value={newRoomDescription}
                onChange={(e) => setNewRoomDescription(e.target.value)}
                placeholder="Enter room description"
                className="w-full p-3 mb-4 rounded-lg bg-gray-700 text-white" />
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
              <h3 className="text-2xl font-bold mb-4">Join Room by ID</h3>
              <input
                type="text"
                value={roomIdToJoin}
                onChange={(e) => setRoomIdToJoin(e.target.value)}
                placeholder="Enter room ID"
                className="w-full p-3 mb-4 rounded-lg bg-gray-700 text-white" />
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

        {/* Video Chat Modal */}
        {/* Video Chat Modal */}
{showVideoModal && (
  <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
    <div 
      ref={videoModalRef}
      className={`bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-4xl h-full max-h-[90vh] flex flex-col ${isFullscreen ? 'max-w-none max-h-none' : ''}`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold">Video Chat: {currentRoom.name}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1"
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <>
                <Minimize size={20} /> <span>Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize size={20} /> <span>Fullscreen</span>
              </>
            )}
          </button>
          <button
            onClick={() => setShowVideoModal(false)}
            className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center"
            title="Close video chat"
          >
            <X size={20} />
          </button>
        </div>
      </div>
      
      <div className="mb-2">
        <p className="text-sm text-gray-300">
          {videoParticipants.length} participants in this video chat
        </p>
      </div>
      
      <div className="flex-1 flex flex-wrap gap-4 overflow-y-auto p-4 bg-gray-800 rounded-lg">
        {/* Local video */}
        <div className="relative w-full md:w-64 h-48 bg-gray-700 rounded-lg overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
            You (Host)
          </div>
        </div>
        
        {/* Remote videos */}
        {peerStreams.map((peerStream) => (
          <div key={peerStream.id} className="relative w-full md:w-64 h-48 bg-gray-700 rounded-lg overflow-hidden">
            <video
              autoPlay
              playsInline
              className="w-full h-full object-cover"
              ref={(ref) => {
                if (ref) ref.srcObject = peerStream.stream;
              }}
            />
            <div className="absolute bottom-2 left-2 text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
              Participant
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-center gap-4 mt-4">
        <button
          onClick={toggleAudio}
          className={`p-3 rounded-full ${audioEnabled ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}
        >
          {audioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
        </button>
        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full ${videoEnabled ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}
        >
          {videoEnabled ? <Camera size={20} /> : <CameraOff size={20} />}
        </button>
      </div>
    </div>
  </div>
)}
      </div>
    </div></>
  );
};

export default CommunityChat;