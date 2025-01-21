import asyncHandler from '../utils/asynchandler.utils.js';
import ApiError from '../utils/API_Error.js';

// Join a Community Room (Group Chat)
const joinCommunityRoom = asyncHandler(async (req, res) => {
    const { userId, roomId } = req.body;

    if (!userId || !roomId) {
        throw new ApiError(400, 'User ID and Room ID are required');
    }

    // Emit socket event to join the group
    req.io.to(roomId).emit('user-joined', { userId, message: `${userId} has joined the room` });

    res.status(200).json({ message: `User ${userId} joined room ${roomId}` });
});

// Send a Message to Community Room
const sendMessageToCommunityRoom = asyncHandler(async (req, res) => {
    const { roomId, userId, message } = req.body;

    if (!roomId || !userId || !message) {
        throw new ApiError(400, 'Room ID, User ID, and Message are required');
    }

    // Emit the message to the room
    req.io.to(roomId).emit('community-message', { userId, message });

    res.status(200).json({ message: 'Message sent successfully' });
});

export { joinCommunityRoom, sendMessageToCommunityRoom };
