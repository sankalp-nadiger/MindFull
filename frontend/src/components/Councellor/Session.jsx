import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from "socket.io-client";
import { motion } from 'framer-motion';

const socket = io("http://localhost:8000", {
  transports: ["websocket"],
  withCredentials: true
});

const Session = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ending, setEnding] = useState(false);
  const [activeRoom, setActiveRoom] = useState(null);

  useEffect(() => {
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

      setSessions((prevSessions) =>
        prevSessions.map((session) =>
          session._id === sessionId ? { ...session, status: 'Active' } : session
        )
      );

      setActiveRoom(response.data.session.roomName);
    } catch (error) {
      alert("Failed to accept session.");
    } finally {
      setLoading(false);
    }
  };

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

      setSessions((prevSessions) =>
        prevSessions.filter((session) => session._id !== sessionId)
      );
      setActiveRoom(null);
      setError('');
    } catch (error) {
      setError("Failed to end session.");
    } finally {
      setEnding(false);
    }
  };

  useEffect(() => {
    const handleSessionEnd = ({ sessionId }) => {
      setSessions((prevSessions) =>
        prevSessions.filter((session) => session._id !== sessionId)
      );
      setActiveRoom(null);
    };

    sessions.forEach(session => {
      socket.on(`sessionEnded-${session._id}`, handleSessionEnd);
    });

    return () => {
      sessions.forEach(session => {
        socket.off(`sessionEnded-${session._id}`, handleSessionEnd);
      });
    };
  }, [sessions]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-r from-purple-500 to-blue-500">
      <motion.div 
        className={`bg-white rounded-lg shadow-lg p-6 ${sessions.length > 0 ? 'w-[95%]' : 'max-w-lg w-full'}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: [20, -5, 0] }}
        transition={{ duration: 0.5, ease: [0.4, 0.0, 0.2, 1] }}
      >
        <h1 className="text-3xl font-semibold text-center mb-4 text-purple-800">
          Counselor Dashboard
        </h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {loading ? (
          <div className="flex justify-center items-center">
            <div className="loader">Loading...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sessions.map((session) => (
              <motion.div
                key={session._id}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <h5 className="text-xl font-semibold">{session.user.username}</h5>
                <p className="text-sm text-gray-600">{session.issueDetails}</p>

                <div className="mt-4">
                  {session.status === 'Pending' && (
                    <button
                      onClick={() => acceptSession(session._id)}
                      className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition"
                      disabled={loading}
                    >
                      {loading ? 'Accepting...' : 'Accept Session'}
                    </button>
                  )}

                  {session.status === 'Active' && (
                    <button
                      onClick={() => endSession(session._id)}
                      className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition mt-2"
                      disabled={ending}
                    >
                      {ending ? 'Ending...' : 'End Session'}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeRoom && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold">Live Video Session</h2>
            <div className="relative pt-[56.25%]">
              <iframe
                src={`https://meet.jit.si/${activeRoom}`}
                className="absolute top-0 left-0 w-full h-full"
                allow="camera; microphone; fullscreen; display-capture"
              ></iframe>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Session;
