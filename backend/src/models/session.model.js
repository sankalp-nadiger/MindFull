import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // changed from student to user
    counselor: { type: mongoose.Schema.Types.ObjectId, ref: "Counsellor", required: true },
    roomName: { type: String, required: true },
    issueDetails: { type: String, required: true },
    status: { 
        type: String, 
        enum: ["Pending", "Active", "Completed"], // added "Active" status for when session is ongoing
        default: "Pending" 
    },
    counselorFeedback: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },

});

export const Session = mongoose.model("Session", sessionSchema);