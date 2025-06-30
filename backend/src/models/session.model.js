import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
    counselor: { type: mongoose.Schema.Types.ObjectId, ref: "Counsellor", required: true },
    roomName: { type: String, required: true },
    issueDetails: { type: String, required: true },
    rating: { type: Number, default: 0 },
    status: { 
        type: String, 
        enum: ["Pending", "Active", "Completed"], // added "Active" status for when session is ongoing
        default: "Pending" 
    },
    counselorFeedback: { type: String, default: "" },
    userNotes: {type: String, default: ""},
    createdAt: { type: Date, default: Date.now },
    startTime: { type: Date, required: true },
    endTime: { type: Date, },
    duration: { type: Number}, // duration in minutes
    counsellorReview: {
        diagnosis: { type: String },
        symptoms: [{ type: String }],
        needsSittings: { type: Boolean },
        recommendedSittings: { type: Number },
        willingToTreat: { type: Boolean },
        notes: { type: String },
        reviewedAt: { type: Date }
    }
});

export const Session = mongoose.model("Session", sessionSchema);