import asyncHandler from "../utils/asynchandler.utils.js";
import ApiError from "../utils/API_Error.js";
import { Counselor } from "../models/counselor.model.js";
import { User } from "../models/user.model.js";
import { Session } from "../models/session.model.js";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const apiKeySid = process.env.TWILIO_API_KEY_SID;
const apiKeySecret = process.env.TWILIO_API_KEY_SECRET;

// Twilio Video Token Generation
const generateTwilioToken = (identity, roomName) => {
    const AccessToken = twilio.jwt.AccessToken;
    const VideoGrant = AccessToken.VideoGrant;

    // Create Video grant for the token
    const videoGrant = new VideoGrant({ room: roomName });

    // Create access token
    const token = new AccessToken(accountSid, apiKeySid, apiKeySecret, { identity });

    // Add the Video grant
    token.addGrant(videoGrant);

    return token.toJwt();
};

// Request a session (Student Side)
export const requestSession = asyncHandler(async (req, res) => {
    const { studentId, issueDetails } = req.body;

    // Validate request
    if (!studentId || !issueDetails) {
        throw new ApiError(400, "Student ID and issue details are required");
    }

    const student = await User.findById(studentId);
    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    // Find an available counselor
    const counselor = await Counselor.findOne({ isAvailable: true });
    if (!counselor) {
        throw new ApiError(404, "No available counselors at the moment");
    }

    // Create a session
    const roomName = `session-${studentId}-${counselor._id}-${Date.now()}`;
    const session = await Session.create({
        student: student._id,
        counselor: counselor._id,
        roomName,
        issueDetails,
        status: "Pending",
    });

    // Mark counselor as unavailable
    counselor.isAvailable = false;
    await counselor.save();

    res.status(201).json({
        message: "Session created successfully",
        sessionId: session._id,
        roomName,
        counselor: {
            id: counselor._id,
            name: counselor.name,
        },
    });
});

// Generating Twilio Token (Student/Counselor)
export const getTwilioToken = asyncHandler(async (req, res) => {
    const { userId, sessionId } = req.body;

    // Validating request
    if (!userId || !sessionId) {
        throw new ApiError(400, "User ID and Session ID are required");
    }

    const session = await Session.findById(sessionId);
    if (!session) {
        throw new ApiError(404, "Session not found");
    }

    // Ensure the user is part of the session
    if (![session.student.toString(), session.counselor.toString()].includes(userId)) {
        throw new ApiError(403, "You are not authorized for this session");
    }

    // Generate token
    const identity = userId;
    const token = generateTwilioToken(identity, session.roomName);

    res.status(200).json({ token, roomName: session.roomName });
});

// End a session (Counselor Side)
export const endSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.body;

    const session = await Session.findById(sessionId);
    if (!session) {
        throw new ApiError(404, "Session not found");
    }

    // Mark session as completed
    session.status = "Completed";
    await session.save();

    // Mark counselor as available again
    const counselor = await Counselor.findById(session.counselor);
    if (counselor) {
        counselor.isAvailable = true;
        await counselor.save();
    }

    res.status(200).json({ message: "Session ended successfully" });
});
