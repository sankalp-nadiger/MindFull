import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VideoChat = () => {
  const [issueDetails, setIssueDetails] = useState('');
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ending, setEnding] = useState(false);

  // Function to request a session
  const requestSession = async () => {
    if (!issueDetails.trim()) {
      setError("Please provide issue details.");
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.post(
        'http://localhost:8000/api/counsellor/request',
        { issueDetails },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
          },
        }
      );
      setSession(response.data.session);
      setError('');
    } catch (error) {
      setError("Failed to request session. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Polling to check if session is accepted
  useEffect(() => {
    if (!session || session.status === "Active") return;
  
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(
          'http://localhost:8000/api/counsellor/sessions',
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
            },
          }
        );
  
        // Check if the requested session is now active
        const updatedSession = response.data.sessions.find(s => s._id === session._id);
        if (updatedSession && updatedSession.status === "Active") {
          setSession(updatedSession);
          clearInterval(interval); // Stop polling once session is accepted
        }
      } catch (error) {
        console.error("Failed to fetch active sessions.");
      }
    }, 5000); // Check every 5 seconds
  
    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [session]);
  

  // Function to end session
  const endSession = async () => {
    if (!session) {
      setError("No active session to end.");
      return;
    }

    try {
      setEnding(true);
      await axios.post(
        'http://localhost:8000/api/counsellor/end',
        { sessionId: session._id },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
          },
        }
      );
      setSession(null);
      setError('');
    } catch (error) {
      setError("Failed to end session. Please try again.");
    } finally {
      setEnding(false);
    }
  };

  return (
    <div>
      <h1>Request a Counseling Session</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!session && (
        <div>
          <textarea
            value={issueDetails}
            onChange={(e) => setIssueDetails(e.target.value)}
            placeholder="Describe your issue"
            rows="4"
            cols="50"
          />
          <button onClick={requestSession} disabled={loading}>
            {loading ? 'Requesting...' : 'Request Session'}
          </button>
        </div>
      )}

      {session && (
        <div>
          <h3>Session Requested!</h3>
          <p>Status: {session.status}</p>
          <p>Counselor: {session.counselorName || "Waiting for counselor..."}</p>

          {/* Show Jitsi Meet when session is active */}
          {session.status === 'Active' && (
            <iframe
              src={`https://meet.jit.si/${session.roomName}`}
              width="100%"
              height="600"
              allow="camera; microphone; fullscreen; display-capture"
            ></iframe>
          )}

          <button onClick={endSession} disabled={ending}>
            {ending ? 'Ending...' : 'End Session'}
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoChat;
