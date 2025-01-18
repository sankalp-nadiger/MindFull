import asyncHandler from "../utils/asynchandler.utils.js";
import ApiError from "../utils/API_Error.js";
import { Counsellor } from "../models/counselor.model.js";
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

export const registerCounsellor = asyncHandler(async (req, res) => {
    const { fullName, email, password, mobileNumber, otp, specifications, certifictions} = req.body;

    // Validate fields
    if ([fullName, email, password, mobileNumber, otp].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    // Verify OTP
    const otpVerification = await verifyOTP(mobileNumber, otp);
    if (!otpVerification.success) {
        throw new ApiError(400, otpVerification.message);
    }

    // Check if counsellor already exists
    const existedCounsellor = await Counsellor.findOne({
        $or: [{ fullName }, { email }],
    });

    if (existedCounsellor) {
        throw new ApiError(409, "User with email or username already exists");
    }

    // Create the counsellor
    const counsellor = await Counsellor.create({
        fullName,
        email,
        password,
        mobileNumber,
        specifications,
        certifictions
    });

    // Send response with created counsellor
    const createdCounsellor = await Counsellor.findById(counsellor._id).select("-password -refreshToken");
    return res
        .status(201)
        .json(new ApiResponse(201, { createdCounsellor }, "Counsellor registered successfully"));
});

// Login Counsellor
export const loginCounsellor = asyncHandler(async (req, res) => {
    const { password, fullName, mobileNumber, otp } = req.body;

    // Validate user credentials
    if (!(mobileNumber && otp)) {
        throw new ApiError(400, "Mobile number and OTP are required");
    }

    const otpVerification = await verifyOTP(mobileNumber, otp);
    if (!otpVerification.success) {
        throw new ApiError(400, otpVerification.message);
    }

    const counsellor = await Counsellor.findOne({
        $or: [{ fullName }, { mobileNumber }],
    });

    if (!counsellor) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await counsellor.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(counsellor._id);

    const loggedInCounsellor = await Counsellor.findById(counsellor._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user: loggedInCounsellor, accessToken, refreshToken },
                "User logged in successfully"
            )
        );
});

// Logout Counsellor
export const logoutCounsellor = asyncHandler(async (req, res) => {
    const { mobileNumber, otp } = req.body;

    // Validate OTP if provided
    if (mobileNumber && otp) {
        const otpVerification = await verifyOTP(mobileNumber, otp);
        if (!otpVerification.success) {
            throw new ApiError(400, otpVerification.message);
        }
    }

    // Remove refresh token to logout
    await Counsellor.findByIdAndUpdate(
        req.counsellor._id,
        {
            $unset: {
                refreshToken: 1, // Remove refresh token from the document
            },
        },
        {
            new: true,
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"));
});

export {getTwilioToken, registerCounsellor, loginCounsellor, logoutCounsellor, generateTwilioToken, endSession, requestSession }