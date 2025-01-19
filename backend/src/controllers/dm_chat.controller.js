import asyncHandler from '../utils/asynchandler.utils.js';
import ApiError from '../utils/API_Error.js';
import User from '../models/user.model.js';
// Start a Personal Chat
const startPersonalChat = asyncHandler(async (req, res) => {
    const { senderId, receiverId } = req.body;

    if (!senderId || !receiverId) {
        throw new ApiError(400, 'Sender ID and Receiver ID are required');
    }

    // Join both users to their private chat room (e.g., based on both IDs)
    const chatRoomId = [senderId, receiverId].sort().join('-');
    const senderSocketId = UserSocketMap[senderId];
    const receiverSocketId = UserSocketMap[receiverId];

    if (senderSocketId) {
        req.io.to(senderSocketId).emit('join-room', { roomId: chatRoomId });
    }
    if (receiverSocketId) {
        req.io.to(receiverSocketId).emit('join-room', { roomId: chatRoomId });
    }
    req.io.to(chatRoomId).emit('chat-started', { message: `Chat started between ${senderId} and ${receiverId}` });
    res.status(200).json({ chatRoomId, message: 'Personal chat started' });
});

// Send a Message in Personal Chat
const sendMessageToUser = asyncHandler(async (req, res) => {
    const { senderId, receiverId, message } = req.body;

    if (!senderId || !receiverId || !message) {
        throw new ApiError(400, 'Sender ID, Receiver ID, and Message are required');
    }

    // Use a unique chat room ID based on both user IDs
    const chatRoomId = [senderId, receiverId].sort().join('-');

    // Emit the message to the private chat room
    req.io.to(chatRoomId).emit('personal-message', { senderId, message });

    res.status(200).json({ message: 'Message sent successfully' });
});

export { startPersonalChat, sendMessageToUser };
