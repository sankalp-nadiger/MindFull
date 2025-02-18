import asyncHandler from '../utils/asynchandler.utils.js';
import { ApiError } from '../utils/API_Error.js';
import { User } from '../models/user.model.js';
import { Chat } from '../models/chat.model.js';
import { Message } from '../models/message.model.js';

// Start a Personal Chat
const startChat = asyncHandler(async (req, res) => {
    const { senderId, receiverId } = req.body;

    if (!senderId || !receiverId) {
        throw new ApiError(400, 'Sender ID and Receiver ID are required');
    }

    // Determine sender and receiver
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
        throw new ApiError(404, 'Sender or Receiver not found');
    }

    // Create a unique chat room ID
    const chatRoomId = [senderId, receiverId].sort().join('-');

    // Check if chat already exists
    let chat = await Chat.findOne({ chatRoomId });

    if (!chat) {
        chat = new Chat({
            chatRoomId,
            users: [senderId, receiverId]
        });
        await chat.save();
    }

    res.status(200).json({ chatRoomId, message: 'Personal chat started', chat });
});

export const sendMessage = asyncHandler(async (req, res) => {
    const { senderId, receiverId, message } = req.body;

    if (!senderId || !receiverId || !message) {
        throw new ApiError(400, 'Sender ID, Receiver ID, and Message are required');
    }

    // Determine sender and receiver
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
        throw new ApiError(404, 'Sender or Receiver not found');
    }

    // Generate the chatRoomId
    const chatRoomId = [senderId, receiverId].sort().join('-');

    // Ensure chat exists
    const chat = await Chat.findOne({ chatRoomId });
    if (!chat) {
        throw new ApiError(404, 'Chat room not found. Start a chat first.');
    }

    // Create and save the message
    const newMessage = new Message({
        chatRoomId,
        senderId,
        message
    });

    await newMessage.save();

    res.status(200).json({ message: 'Message sent successfully', newMessage });
});
