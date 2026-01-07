import asyncHandler from '../utils/asynchandler.utils.js';
import { ApiError } from '../utils/API_Error.js';
import { Community } from '../models/community.model.js';  // Import your Community model
import { User } from '../models/user.model.js';
import mongoose from 'mongoose';

// Create a Community Room (Group Chat)
const createCommunityRoom = asyncHandler(async (req, res) => {
    const { roomName,  description } = req.body;
    const userId=req.user._id;
    if (!roomName || !userId || !description) {
        throw new ApiError(400, 'Room name, userId, and description are required');
    }

    const roomId = `room-${Date.now()}`; // Generate a unique Room ID

    // Create the community room
    const newRoom = new Community({
        name: roomName,
        members: [userId],  // Initially, the user who creates the room is the first member
        description: description,
        createdBy: userId,  // Store the user who created the room
    });

    // Save the community room to the database
    await newRoom.save();

    // Populate the createdBy field with the user details
    const populatedRoom = await Community.findById(newRoom._id).populate('createdBy', 'name email');

    res.status(201).json({
        message: `Room '${roomName}' created successfully`,
        roomId: newRoom._id,
        room: populatedRoom,
    });
});

// Get all Community Rooms
const getCommunityRooms = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    // Include a lightweight isMember flag per room so frontend can show Join/Leave
    const rooms = await Community.find({}); // Get all rooms

    res.status(200).json({ rooms: rooms, senderUsername: user.username, userId: userId.toString() });
});

// Join a Community Room (Group Chat) - HTTP-based
const joinCommunityRoom = asyncHandler(async (req, res) => {
    const { roomId } = req.body;
    const userId = req.user._id;
    if (!userId || !roomId) {
        throw new ApiError(400, 'User ID and Room ID are required');
    }

    // Lookup room by full ObjectId when valid, otherwise try to match by short/truncated id prefix
    let room = null;
    try {
        if (mongoose.Types.ObjectId.isValid(roomId)) {
            room = await Community.findById(roomId);
        }
    } catch (err) {
        room = null;
    }

    if (!room) {
        // Try to find by prefix (e.g., UI may send last 8 chars shown in UI)
        const allRooms = await Community.find({});
        room = allRooms.find(r => r._id.toString().endsWith(roomId) || r._id.toString().startsWith(roomId));
    }

    if (!room) {
        throw new ApiError(404, 'Room not found');
    }

    const isMember = Array.isArray(room.members) && room.members.some(m => m.toString() === userId.toString());
    if (isMember) {
        return res.status(200).json({ message: 'User already a member of room', userId: userId.toString(), alreadyMember: true });
    }

    // Add user to the room's members
    room.members.push(userId);
    await room.save();

    res.status(200).json({ message: `User ${userId} joined room ${room._id}`, userId: userId.toString(), alreadyMember: false });
});

// Send a Message to Community Room - HTTP-based
const sendMessageToCommunityRoom = asyncHandler(async (req, res) => {
    const { roomId, message } = req.body;
    const userId = req.user._id;
    if (!roomId || !userId || !message) {
        throw new ApiError(400, 'Room ID, User ID, and Message are required');
    }

    const username = req.user.username;
    // Save the message in the database (or similar)
    let room = null;
    try {
        if (mongoose.Types.ObjectId.isValid(roomId)) {
            room = await Community.findById(roomId);
        }
    } catch (err) {
        room = null;
    }
    if (!room) {
        const allRooms = await Community.find({});
        room = allRooms.find(r => r._id.toString().endsWith(roomId) || r._id.toString().startsWith(roomId));
    }
    if (!room) {
        throw new ApiError(404, 'Room not found');
    }

    // Here, we assume you have a Message model where messages are stored
    const newMessage = {
        roomId,
        sender: username,
        message,
        timestamp: new Date(),
    };

    // You can either save messages to a database or store them in the room object (if it's small data)
    room.messages.push(newMessage);
    await room.save();

    res.status(200).json({ message: 'Message sent successfully' });
});

export { createCommunityRoom, joinCommunityRoom, sendMessageToCommunityRoom, getCommunityRooms };
