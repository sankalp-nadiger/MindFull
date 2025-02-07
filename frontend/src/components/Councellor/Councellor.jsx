import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Counsellor = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ending, setEnding] = useState(false);
  const [activeRoom, setActiveRoom] = useState(null); // Store Jitsi room name

  useEffect(() => {
    // Fetch active sessions for the counselor
    const fetchActiveSessions = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:8000/api/counsellor/sessions`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
            },
          }
        );
        setSessions(response.data.sessions);
        setError('');
      } catch (error) {
        setError("Failed to load active sessions.");
      } finally {
        setLoading(false);
      }
    };

    fetchActiveSessions();
  }, []);

  // Accept the session
  const acceptSession = async (sessionId) => {
    try {
      setLoading(true);
      const response = await axios.post(
        'http://localhost:8000/api/counsellor/accept',
        { sessionId },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
          },
        }
      );

      alert(response.data.message);

      // Update session status locally to 'Active' and set the Jitsi room
      setSessions((prevSessions) =>
        prevSessions.map((session) =>
          session._id === sessionId ? { ...session, status: 'Active' } : session
        )
      );

      // Set Jitsi Room Name from response
      setActiveRoom(response.data.session.roomName);
    } catch (error) {
      alert("Failed to accept session.");
    } finally {
      setLoading(false);
    }
  };

  // End the session (Counselor side)
  const endSession = async (sessionId) => {
    try {
      setEnding(true);
      await axios.post(
        'http://localhost:8000/api/counsellor/end',
        { sessionId },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
          },
        }
      );

      // Remove session from list
      setSessions((prevSessions) =>
        prevSessions.filter((session) => session._id !== sessionId)
      );

      // Remove Jitsi iframe
      setActiveRoom(null);
      setError('');
    } catch (error) {
      setError("Failed to end session.");
    } finally {
      setEnding(false);
    }
  };

  return (
    <div>
      <h1>Counselor Dashboard</h1>

      {/* Show Error */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {loading ? (
        <p>Loading sessions...</p>
      ) : (
        <ul>
          {sessions.map((session) => (
            <li key={session._id}>
              <p>Issue: {session.issueDetails}</p>
              <p>Student: {session.user.name}</p>

              {session.status === 'Pending' && (
                <button onClick={() => acceptSession(session._id)} disabled={loading}>
                  {loading ? 'Accepting...' : 'Accept Session'}
                </button>
              )}

              {session.status === 'Active' && (
                <button onClick={() => endSession(session._id)} disabled={ending}>
                  {ending ? 'Ending...' : 'End Session'}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Show Jitsi Meet if active room is set */}
      {activeRoom && (
        <div>
          <h2>Live Video Session</h2>
          <iframe
            src={`https://meet.jit.si/${activeRoom}`}
            width="100%"
            height="600"
            allow="camera; microphone; fullscreen; display-capture"
          ></iframe>
        </div>
      )}
    </div>
  );
};

export default Counsellor;
