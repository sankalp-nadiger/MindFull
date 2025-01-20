import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    counselor: { type: mongoose.Schema.Types.ObjectId, ref: "Counselor", required: true },
    roomName: { type: String, required: true },
    issueDetails: { type: String, required: true },
    status: { type: String, enum: ["Pending", "Completed"], default: "Pending" },
    counselorFeedback: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
});

export const Session = mongoose.model("Session", sessionSchema);
