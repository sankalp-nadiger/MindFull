import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
    chatRoomId: { type: String, required: true, unique: true },

    // Users can be of type "User" or "Doctor"
    users: [{
        userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    }],

}, { timestamps: true });

export const Chat = mongoose.model('Chat', chatSchema);
