import React, { useState, useEffect } from 'react';

const VideoChat = () => {
  const [issueDetails, setIssueDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);
  const [roomName, setRoomName] = useState('');
  const [token, setToken] = useState('');
  const [userId, setUserId] = useState(null);  // State to store userId
  const JWTToken = sessionStorage.getItem("accessToken"); // Retrieve the token from session storage

  // Retrieve userId from sessionStorage or user data
  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user"));  // Retrieve the user object
    console.log(user);  // Log the user object to check if the 'id' exists
    if (user && user._id) {
      setUserId(user._id);  // Set userId from the stored user data
    }
  }, []);
  

  // Request a session
  const handleRequestSession = async () => {
    if (!issueDetails) {
      setError('Please provide issue details');
      return;
    }

    if (!userId) {
      setError('User ID is not available');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/counsellor/request', {  // Updated URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JWTToken}`,
        },
        body: JSON.stringify({
          studentId: userId,
          issueDetails,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        setSelectedSession(data.session);
        setRoomName(data.roomName);
      } else {
        setError(data.message || 'Error requesting session');
      }
    } catch (error) {
      setError('No available Counsellor at Momemt pls wait');
    } finally {
      setLoading(false);
    }
  };

  // Get Twilio token and join a session
  const handleJoinSession = async () => {
    if (!selectedSession) {
      setError('Please request a session first');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/counsellor/token/student', {  // Updated URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JWTToken}`,
        },
        body: JSON.stringify({
          sessionId: selectedSession._id,
          userId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        setRoomName(data.roomName);
      } else {
        setError('Failed to get token');
      }
    } catch (error) {
      setError('Something went wrong while joining the session');
    }
  };

  // End session
  const handleEndSession = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/counsellor/end', {  // Updated URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId: selectedSession._id }),
      });

      if (response.ok) {
        setSelectedSession(null);
        setRoomName('');
        setToken('');
        alert('Session ended');
      } else {
        setError('Failed to end session');
      }
    } catch (error) {
      setError('Something went wrong while ending the session');
    }
  };

  // Jitsi Video Call integration
  const startJitsiMeeting = () => {
    const domain = 'meet.jit.si';  // Jitsi Meet server domain

    const options = {
      roomName: roomName,
      width: '100%',
      height: 500,
      parentNode: document.getElementById('jitsi-container'),
      configOverwrite: { startWithAudioMuted: true, startWithVideoMuted: false },
      interfaceConfigOverwrite: { filmStripOnly: false },
    };

    const api = new window.JitsiMeetExternalAPI(domain, options);
    api.executeCommand('displayName', 'Student');  // Or dynamic name

    // Cleanup when the component unmounts
    return api;
  };

  useEffect(() => {
    if (roomName && token) {
      startJitsiMeeting();
    }
  }, [roomName, token]);

  return (
    <div className="video-chat-page bg-gray-900 min-h-screen flex flex-col items-center justify-center">
      <h2 className="text-white text-2xl mb-6">Video Call Dashboard</h2>

      {/* Request session form */}
      {!selectedSession && (
        <div className="request-session bg-indigo-500 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-white mb-4">Request a Session</h3>
          <textarea
            value={issueDetails}
            onChange={(e) => setIssueDetails(e.target.value)}
            placeholder="Describe your issue..."
            rows="4"
            cols="50"
            className="p-2 mb-4 w-full"
          />
          <button
            onClick={handleRequestSession}
            disabled={loading}
            className="bg-blue-600 text-white p-2 rounded mt-2"
          >
            {loading ? 'Requesting...' : 'Request Session'}
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      )}

      {/* Video Call */}
      {selectedSession && !token && (
        <div className="my-6">
          <h3 className="text-white mb-4">Session: {selectedSession.issueDetails}</h3>
          <button
            onClick={handleJoinSession}
            className="bg-green-600 text-white p-2 rounded mt-2"
          >
            Join Session
          </button>
        </div>
      )}

      {/* Video Call */}
      {token && roomName && (
        <div className="video-call mt-8">
          <h3 className="text-white text-xl">Session: {selectedSession.issueDetails}</h3>
          <button
            onClick={handleEndSession}
            className="bg-red-500 text-white p-2 rounded mt-4"
          >
            End Session
          </button>

          {/* Jitsi Video Call */}
          <div id="jitsi-container" style={{ height: '500px' }}></div>
        </div>
      )}
    </div>
  );
};

export default VideoChat;
