// src/components/VideoCallPage.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const VideoCallPage = () => {
  const [token, setToken] = useState(null);
  const [roomName, setRoomName] = useState('mental-wellness-room');
  const [room, setRoom] = useState(null);
  const [localParticipant, setLocalParticipant] = useState(null);
  const localMedia = useRef(null);

  const fetchToken = async () => {
    try {
      const response = await axios.get('http://localhost:5000/token', {
        params: {
          identity: 'user1',
          room: roomName,
        },
      });
      setToken(response.data.token);
    } catch (error) {
      console.error('Error fetching token:', error);
    }
  };

  const connectToRoom = async () => {
    if (!token) return;

    const Video = require('twilio-video');

    Video.connect(token, { name: roomName }).then((room) => {
      setRoom(room);

      room.participants.forEach(participantConnected);
      room.on('participantConnected', participantConnected);
      room.on('participantDisconnected', participantDisconnected);
      room.once('disconnected', (error) => room.participants.forEach(participantDisconnected));
    });

    const participantConnected = (participant) => {
      console.log(`Participant "${participant.identity}" connected`);

      const div = document.createElement('div');
      div.id = participant.sid;
      div.className = 'remote-participant';

      participant.tracks.forEach((publication) => {
        if (publication.isSubscribed) trackSubscribed(div, publication.track);
      });

      participant.on('trackSubscribed', (track) => trackSubscribed(div, track));
      participant.on('trackUnsubscribed', trackUnsubscribed);

      document.getElementById('remote-participants').appendChild(div);
    };

    const participantDisconnected = (participant) => {
      console.log(`Participant "${participant.identity}" disconnected`);
      document.getElementById(participant.sid).remove();
    };

    const trackSubscribed = (div, track) => {
      div.appendChild(track.attach());
    };

    const trackUnsubscribed = (track) => {
      track.detach().forEach((element) => element.remove());
    };
  };

  const setupLocalMedia = async () => {
    const Video = require('twilio-video');
    const localParticipant = await Video.createLocalTracks({ audio: true, video: true });

    localParticipant.forEach((track) => {
      localMedia.current.appendChild(track.attach());
    });

    setLocalParticipant(localParticipant);
  };

  useEffect(() => {
    fetchToken();
  }, []);

  useEffect(() => {
    if (token) {
      connectToRoom();
      setupLocalMedia();
    }
  }, [token]);

  return (
    <div className="video-call-page">
      <button onClick={fetchToken}>Join Video Call</button>

      <div id="local-media" ref={localMedia}></div>
      <div id="remote-participants"></div>
    </div>
  );
};

export default VideoCallPage;