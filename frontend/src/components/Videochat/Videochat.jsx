import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const VideoChat = ({ userType = 'user' }) => {
  const [issueDetails, setIssueDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [session, setSession] = useState(null);
  const [jitsiApi, setJitsiApi] = useState(null);
  const navigate = useNavigate();

  const user = JSON.parse(sessionStorage.getItem("user"));
  const JWTToken = sessionStorage.getItem("accessToken");

  useEffect(() => {
    if (userType === 'counsellor') {
      fetchActiveSessions();
    }
    return () => {
      if (jitsiApi) {
        jitsiApi.dispose();
      }
    };
  }, [userType]);

  const fetchActiveSessions = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/counsellor/sessions/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${JWTToken}`
        }
      });
      const data = await response.json();
      if (response.ok && data.sessions.length > 0) {
        setSession(data.sessions[0]); // Get the most recent session
      }
    } catch (error) {
      setError('Failed to fetch active sessions');
    }
  };

  const handleRequestSession = async () => {
    if (!issueDetails) {
      setError('Please provide issue details');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/counsellor/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JWTToken}`
        },
        body: JSON.stringify({
          userId: user._id,
          issueDetails,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setSession(data.session);
        setError('');
      } else {
        setError(data.message || 'Failed to request session');
      }
    } catch (error) {
      setError('No available counsellor at moment, please wait');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptSession = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/counsellor/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JWTToken}`
        },
        body: JSON.stringify({
          sessionId: session._id,
          counselorId: user._id
        }),
      });

      const data = await response.json();
      if (response.ok) {
        startJitsiMeet(data.session.roomName);
      }
    } catch (error) {
      setError('Failed to accept session');
    }
  };

  const startJitsiMeet = (roomName) => {
    const domain = 'meet.jit.si';
    const options = {
      roomName: roomName,
      width: '100%',
      height: 500,
      parentNode: document.querySelector('#jitsi-container'),
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        prejoinPageEnabled: false
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        DISPLAY_WELCOME_PAGE_CONTENT: false,
        DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT: false,
      },
      userInfo: {
        displayName: user.name
      }
    };

    const api = new window.JitsiMeetExternalAPI(domain, options);
    setJitsiApi(api);

    api.addEventListener('videoConferenceLeft', () => {
      handleEndSession();
    });
  };

  const handleEndSession = async () => {
    if (!session) return;

    try {
      await fetch('http://localhost:8000/api/counsellor/end', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JWTToken}`
        },
        body: JSON.stringify({
          sessionId: session._id,
          userId: user._id
        }),
      });

      setSession(null);
      if (jitsiApi) {
        jitsiApi.dispose();
        setJitsiApi(null);
      }
      navigate('/dashboard');
    } catch (error) {
      setError('Failed to end session');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-8">
          {userType === 'user' ? 'Request Counselling Session' : 'Counsellor Dashboard'}
        </h2>

        {error && (
          <div className="bg-red-500 text-white p-4 rounded mb-4">
            {error}
          </div>
        )}

        {userType === 'user' && !session && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <textarea
              className="w-full p-4 rounded bg-gray-700 text-white mb-4"
              rows="4"
              value={issueDetails}
              onChange={(e) => setIssueDetails(e.target.value)}
              placeholder="Describe your concerns..."
            />
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              onClick={handleRequestSession}
              disabled={loading}
            >
              {loading ? 'Requesting...' : 'Request Session'}
            </button>
          </div>
        )}

        {userType === 'counsellor' && session?.status === 'Pending' && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
            <h3 className="text-xl text-white mb-4">New Session Request</h3>
            <p className="text-gray-300 mb-4">{session.issueDetails}</p>
            <button
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
              onClick={handleAcceptSession}
            >
              Accept Session
            </button>
          </div>
        )}

        {session?.status === 'Active' && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <div id="jitsi-container" className="w-full rounded overflow-hidden" />
            <button
              className="mt-4 bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
              onClick={handleEndSession}
            >
              End Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoChat;