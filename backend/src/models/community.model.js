import mongoose from 'mongoose';
import {Schema, model} from 'mongoose';

// Ensure your Community model has this structure
const communitySchema = new mongoose.Schema({
    name: String,
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    description: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    messages: [{
        sender: { type: String},
        message: String,
        timestamp: Date
    }]
});
export const Community= mongoose.model("Community", communitySchema);