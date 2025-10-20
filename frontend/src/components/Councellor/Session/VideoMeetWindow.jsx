import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// WebRTC Video Meet Window Component
const VideoMeetWindow = ({ activeRoom, onClose, socket, userId, userType }) => {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [remoteUserConnected, setRemoteUserConnected] = useState(false);

  const windowRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);

  // WebRTC Configuration
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
    ]
  };

  // Initialize WebRTC
  useEffect(() => {
    initializeWebRTC();

    // Socket event listeners
    socket.on('user-joined', handleUserJoined);
    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleIceCandidate);
    socket.on('user-left', handleUserLeft);

    return () => {
      cleanupWebRTC();
      socket.off('user-joined', handleUserJoined);
      socket.off('offer', handleOffer);
      socket.off('answer', handleAnswer);
      socket.off('ice-candidate', handleIceCandidate);
      socket.off('user-left', handleUserLeft);
    };
  }, []);

  const initializeWebRTC = async () => {
    try {
      console.log('🚀 Initializing WebRTC for room:', activeRoom);
      setConnectionStatus('initializing');

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      console.log('📹 Local stream obtained:', stream.getTracks().map(t => `${t.kind}: ${t.enabled}`));

      // Create peer connection
      peerConnectionRef.current = new RTCPeerConnection(rtcConfig);

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        console.log('➕ Adding track to peer connection:', track.kind);
        peerConnectionRef.current.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnectionRef.current.ontrack = (event) => {
        console.log('📺 Received remote track:', event.track.kind);
        remoteStreamRef.current = event.streams[0];
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Handle ICE candidates
      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('🧊 Sending ICE candidate');
          socket.emit('ice-candidate', {
            room: activeRoom,
            candidate: event.candidate,
            from: userId
          });
        }
      };

      // Handle connection state changes
      peerConnectionRef.current.onconnectionstatechange = () => {
        const state = peerConnectionRef.current.connectionState;
        console.log('🔗 Connection state changed:', state);
        setConnectionStatus(state);
        
        if (state === 'connected') {
          setRemoteUserConnected(true);
        } else if (state === 'disconnected' || state === 'failed' || state === 'closed') {
          setRemoteUserConnected(false);
        }
      };

      // Join room
      socket.emit('join-room', {
        room: activeRoom,
        userId: userId,
        userType: userType
      });

      setConnectionStatus('waiting');
      console.log('🏠 Joined room:', activeRoom);

    } catch (error) {
      console.error('❌ Error initializing WebRTC:', error);
      setConnectionStatus('error');
    }
  };

  const handleUserJoined = async (data) => {
    console.log('👋 User joined:', data);
    setRemoteUserConnected(true);

    if (data.userId !== userId && peerConnectionRef.current) {
      // Create and send offer
      try {
        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(offer);
        
        console.log('📤 Sending offer');
        socket.emit('offer', {
          room: activeRoom,
          offer: offer,
          from: userId,
          to: data.userId
        });
      } catch (error) {
        console.error('❌ Error creating offer:', error);
      }
    }
  };

  const handleOffer = async (data) => {
    console.log('📥 Received offer from:', data.from);
    
    if (peerConnectionRef.current) {
      try {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
        
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        
        console.log('📤 Sending answer');
        socket.emit('answer', {
          room: activeRoom,
          answer: answer,
          from: userId,
          to: data.from
        });
      } catch (error) {
        console.error('❌ Error handling offer:', error);
      }
    }
  };

  const handleAnswer = async (data) => {
    console.log('📥 Received answer from:', data.from);
    
    if (peerConnectionRef.current) {
      try {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
        console.log('✅ Remote description set');
      } catch (error) {
        console.error('❌ Error handling answer:', error);
      }
    }
  };

  const handleIceCandidate = async (data) => {
    console.log('🧊 Received ICE candidate from:', data.from);
    
    if (peerConnectionRef.current) {
      try {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        console.log('✅ ICE candidate added');
      } catch (error) {
        console.error('❌ Error adding ICE candidate:', error);
      }
    }
  };

  const handleUserLeft = (data) => {
    console.log('👋 User left:', data);
    setRemoteUserConnected(false);
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
        console.log('📹 Video toggled:', videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
        console.log('🎤 Audio toggled:', audioTrack.enabled);
      }
    }
  };

  const cleanupWebRTC = () => {
    console.log('🧹 Cleaning up WebRTC');
    
    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('⏹️ Stopped track:', track.kind);
      });
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Leave room
    socket.emit('leave-room', {
      room: activeRoom,
      userId: userId
    });

    console.log('✅ WebRTC cleanup completed');
  };

  const handleClose = () => {
    cleanupWebRTC();
    onClose();
  };

  // Dragging logic (same as before)
  const handleMouseDown = (e) => {
    if (e.target.closest('.window-controls') || e.target.closest('.resize-handle')) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - size.width, e.clientX - dragStart.x)),
        y: Math.max(-size.height + 100, Math.min(window.innerHeight - 100, e.clientY - dragStart.y))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleResize = (e, direction) => {
    e.preventDefault();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = size.width;
    const startHeight = size.height;
    const startPosX = position.x;
    const startPosY = position.y;

    const onMouseMove = (e) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startPosX;
      let newY = startPosY;

      if (direction.includes('right')) {
        newWidth = Math.max(400, startWidth + deltaX);
      }
      if (direction.includes('left')) {
        newWidth = Math.max(400, startWidth - deltaX);
        newX = startPosX + (startWidth - newWidth);
      }
      if (direction.includes('bottom')) {
        newHeight = Math.max(300, startHeight + deltaY);
      }
      if (direction.includes('top')) {
        newHeight = Math.max(300, startHeight - deltaY);
        newY = startPosY + (startHeight - newHeight);
      }

      setSize({ width: newWidth, height: newHeight });
      setPosition({ x: newX, y: newY });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      setIsResizing(false);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart, position.x, position.y, size.width, size.height]);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-400';
      case 'connecting': return 'bg-yellow-400';
      case 'waiting': return 'bg-blue-400';
      case 'error': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'CONNECTED';
      case 'connecting': return 'CONNECTING';
      case 'waiting': return 'WAITING FOR USER';
      case 'error': return 'CONNECTION ERROR';
      default: return 'INITIALIZING';
    }
  };

  return (
    <motion.div
      ref={windowRef}
      className={`fixed z-50 bg-white rounded-2xl shadow-2xl border border-slate-300 overflow-hidden ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      } ${isResizing ? 'select-none' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: isMinimized ? 'auto' : `${size.height}px`,
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      {/* Window Header */}
      <div 
        className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">Live Video Session</h3>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full animate-pulse ${getStatusColor()}`}></div>
                <span className="text-blue-100 text-xs">{getStatusText()}</span>
              </div>
            </div>
          </div>
          
          {/* Window Controls */}
          <div className="window-controls flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="w-6 h-6 bg-yellow-500 hover:bg-yellow-600 rounded-full flex items-center justify-center transition-colors duration-200"
              title={isMinimized ? "Restore" : "Minimize"}
            >
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMinimized ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                )}
              </svg>
            </button>
            <button
              onClick={handleClose}
              className="w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors duration-200"
              title="Close"
            >
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Window Content */}
      {!isMinimized && (
        <div className="relative bg-slate-900" style={{ height: `${size.height - 60}px` }}>
          {/* Video Container */}
          <div className="relative w-full h-full">
            {/* Remote Video (Full Screen) */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover bg-slate-800"
            />
            
            {/* Local Video (Picture-in-Picture) */}
            <div className="absolute top-4 right-4 w-48 h-36 bg-slate-700 rounded-lg overflow-hidden border-2 border-white shadow-lg">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {!isVideoOn && (
                <div className="absolute inset-0 bg-slate-600 flex items-center justify-center">
                  <div className="text-center text-white">
                    <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18 12M6 6l12 12" />
                    </svg>
                    <span className="text-xs">Video Off</span>
                  </div>
                </div>
              )}
            </div>

            {/* Connection Status Overlay */}
            {!remoteUserConnected && (
              <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-4"></div>
                  <h3 className="text-xl font-semibold mb-2">Waiting for participant...</h3>
                  <p className="text-slate-300">Room: {activeRoom}</p>
                </div>
              </div>
            )}

            {/* Controls Bar */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-black/50 backdrop-blur-sm rounded-full px-6 py-3">
              <button
                onClick={toggleAudio}
                className={`p-3 rounded-full transition-all duration-200 ${
                  isAudioOn 
                    ? 'bg-slate-600 hover:bg-slate-700 text-white' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
                title={isAudioOn ? 'Mute Audio' : 'Unmute Audio'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isAudioOn ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  )}
                </svg>
              </button>

              <button
                onClick={toggleVideo}
                className={`p-3 rounded-full transition-all duration-200 ${
                  isVideoOn 
                    ? 'bg-slate-600 hover:bg-slate-700 text-white' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
                title={isVideoOn ? 'Turn Off Video' : 'Turn On Video'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isVideoOn ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18 12M6 6l12 12" />
                  )}
                </svg>
              </button>

              <button
                onClick={handleClose}
                className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all duration-200"
                title="End Call"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resize Handles (same as before) */}
      {!isMinimized && (
        <>
          {/* Corner handles */}
          <div 
            className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize resize-handle"
            onMouseDown={(e) => handleResize(e, 'top-left')}
          />
          <div 
            className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize resize-handle"
            onMouseDown={(e) => handleResize(e, 'top-right')}
          />
          <div 
            className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize resize-handle"
            onMouseDown={(e) => handleResize(e, 'bottom-left')}
          />
          <div 
            className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize resize-handle bg-gradient-to-tl from-blue-500/20 to-transparent"
            onMouseDown={(e) => handleResize(e, 'bottom-right')}
          />
          
          {/* Edge handles */}
          <div 
            className="absolute top-0 left-3 right-3 h-1 cursor-n-resize resize-handle"
            onMouseDown={(e) => handleResize(e, 'top')}
          />
          <div 
            className="absolute bottom-0 left-3 right-3 h-1 cursor-s-resize resize-handle"
            onMouseDown={(e) => handleResize(e, 'bottom')}
          />
          <div 
            className="absolute left-0 top-3 bottom-3 w-1 cursor-w-resize resize-handle"
            onMouseDown={(e) => handleResize(e, 'left')}
          />
          <div 
            className="absolute right-0 top-3 bottom-3 w-1 cursor-e-resize resize-handle"
            onMouseDown={(e) => handleResize(e, 'right')}
          />
        </>
      )}
    </motion.div>
  );
};

export default VideoMeetWindow;