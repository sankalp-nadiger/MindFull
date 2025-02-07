import asyncHandler from "../utils/asynchandler.utils.js";
import {ApiError} from "../utils/API_Error.js";
import ApiResponse from "../utils/API_Response.js";
import { Counsellor } from "../models/counsellor.model.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Session } from "../models/session.model.js";
import { verifyOTP } from "./parent.controller.js";
import app from "../app.js"
//  import { Server } from "socket.io";
 import {server,io} from "../index.js"
// import http from "http";
// 
// const io = new Server(server, {
//     cors: {
//         origin: "http://localhost:5173", // Your frontend URL
//         methods: ["GET", "POST"]
//     }
// });
const generateAccessAndRefreshTokens = async (userId) => {
    try {
      const counsellor = await Counsellor.findById(userId);
      if (!counsellor) {
        throw new ApiError(404, "Counsellor not found");
      }
  
      console.log("Counsellor found:", counsellor);
  
      const accessToken = counsellor.generateAccessToken();
      const refreshToken = counsellor.generateRefreshToken();
  
      console.log("Access token:", accessToken);
      console.log("Refresh token:", refreshToken);
  
      counsellor.refreshToken = refreshToken;
      await counsellor.save({ validateBeforeSave: false });
  
      return { accessToken, refreshToken };
    } catch (error) {
      console.error("Error generating tokens:", error);
      throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
};

export const requestSession = asyncHandler(async (req, res) => {
    const { issueDetails } = req.body;
    const userId=req.user._id;
    if (!userId || !issueDetails) {
        throw new ApiError(400, "User ID and issue details are required");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Find an available counselor
    const counselor = await Counsellor.findOne({ isAvailable: true });
    if (!counselor) {
        throw new ApiError(404, "No available counselors at the moment");
    }

    // Create a unique room name
    const roomName = `counseling-${userId}-${counselor._id}-${Date.now()}`;
    
    // Create a session
    const session = await Session.create({
        user: user._id,
        counselor: counselor._id,
        roomName,
        issueDetails,
        status: "Pending"
    });

    res.status(201).json({
        success: true,
        message: "Session requested successfully",
        session: {
            _id: session._id,
            roomName,
            counselorName: counselor.name,
            counselorId: counselor._id,
            status: "Pending",
            issueDetails
        }
    });
});

// Accept Session (Counselor Side)
export const acceptSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.body;
    const counselorId= req.counsellor._id;
    const counselor = await Counsellor.findById(counselorId);
    const session = await Session.findById(sessionId);
    if (!session) {
        throw new ApiError(404, "Session not found");
    }

    // if (session.counselor.toString() !== counselorId) {
    //     throw new ApiError(403, "Not authorized to accept this session");
    // }

    if (session.status !== "Pending") {
        throw new ApiError(400, "Session is not in pending state");
    }
    session.counselor=counselorId;
        // Mark counselor as unavailable
        counselor.isAvailable = false;
        await counselor.save();
    
    session.status = "Active";
    await session.save();

    res.status(200).json({
        success: true,
        message: "Session accepted",
        session: {
            _id: session._id,
            roomName: session.roomName,
            status: "Active",
            
        }
    });
});

// End Session
export const endSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.body;
    let userId;
    if(!req.isCounsellor){
    userId= req.user._id;}
    else{
     userId= req.counsellor._id;
    }
    const session = await Session.findById(sessionId);
    if (!session) {
        throw new ApiError(404, "Session not found");
    }
    console.log(session.counselor.toString())
    console.log(userId)
    // Verify that the user ending the session is either the counselor or the user
    if (![session.counselor.toString(), session.user.toString()].includes(userId.toString())) {
        throw new ApiError(403, "Not authorized to end this session");
    }
    
    session.status = "Completed";
    await session.save();
    io.emit(`sessionEnded-${sessionId}`, { sessionId });
    // Make counselor available again
    const counselor = await Counsellor.findById(session.counselor);
    if (counselor) {
        counselor.isAvailable = true;
        await counselor.save();
    }

    res.status(200).json({
        success: true,
        message: "Session ended successfully"
    });
});

// Get Active Sessions (Counselor Side)
export const getActiveSessions = asyncHandler(async (req, res) => {
    const counselorId  = req.counsellor._id;

    const sessions = await Session.find({
        counselor: counselorId,
        status: { $in: ["Pending", "Active"] }
    }).populate('user', 'username');

    res.status(200).json({
        success: true,
        sessions
    });
});
export const registerCounsellor = asyncHandler(async (req, res) => {
    if (typeof req.body.availability === 'string') {
        req.body.availability = JSON.parse(req.body.availability);
    }
    const { 
        fullName, 
        email, 
        password, 
        mobileNumber, 
        otp, 
        specifications = [], 
        yearExp, 
        availability = [],
    } = req.body;
    //console.log(typeof req.body.availability);  // Should log "object" (array)
    let certifications =[];
    if (req.files && req.files.length > 0) {
        certifications = req.files.map(file => ({
            url: file.path, // Or use a cloud storage URL if uploading to cloud
            fileName: file.filename,
        }));}
        console.log(req.body.availability);  // Check if it's an array or string

    // Validate fields
    if ([fullName, email, password, mobileNumber, otp, yearExp].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }
    let certificateImgUrl = null;
    const certificateLocalPath =
      (req?.files?.certificateImage && req.files.certificateImage[0]?.path) || null;
  
    if (certificateLocalPath) {
      const certificateImg = await uploadOnCloudinary(certificateLocalPath, { folder: Mindfull });
  
      if (!certificateImg) {
        throw new ApiError(400, "Certificate upload failed");
      }
  
      certificateImgUrl = certificateImg.url;
    }
    console.log(req.body);
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
         specification: specifications,
        yearexp: yearExp,
        certifications: certificateImgUrl ? [certificateImgUrl] : [], 
         availability
    });


    // Send response with created counsellor
    const createdCounsellor = await Counsellor.findById(counsellor._id).select("-password -refreshToken");
    return res
        .status(201)
        .json(new ApiResponse(201, { createdCounsellor }, "Counsellor registered successfully"));
});

// Login Counsellor
export const loginCounsellor = asyncHandler(async (req, res) => {
    const { password, email, mobileNumber, otp } = req.body;

    // Validate user credentials
    if (!(mobileNumber && otp)) {
        throw new ApiError(400, "Mobile number and OTP are required");
    }

    const otpVerification = await verifyOTP(mobileNumber, otp);
    if (!otpVerification.success) {
        throw new ApiError(400, otpVerification.message);
    }

    const counsellor = await Counsellor.findOne({
        $or: [{ email }, { mobileNumber }],
    });

    if (!counsellor) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await counsellor.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }
    counsellor.isAvailable = true;
    await counsellor.save();

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

export const updateFeedback = asyncHandler(async (req, res) => {
    const counsellorId = req.counsellor._id;
    const { feedback } = req.body;

    // Validate inputs
    if (!counsellorId || !feedback?.trim()) {
        throw new ApiError(400, "Counsellor ID and feedback are required");
    }

    // Find the counsellor and update feedback
    const counsellor = await Counsellor.findById(counsellorId);
    if (!counsellor) {
        throw new ApiError(404, "Counsellor not found");
    }

    counsellor.feedback.push(feedback);
    await counsellor.save();

    return res
        .status(200)
        .json(new ApiResponse(200, { feedback: counsellor.feedback }, "Feedback updated successfully"));
});

export const updateProfile = asyncHandler(async (req, res) => {
    const counsellorId= req.counsellor._id;
    const { updates } = req.body;

    // Validate inputs
    if (!counsellorId || typeof updates !== "object") {
        throw new ApiError(400, "Counsellor ID and updates object are required");
    }

    // Allowed fields for update
    const allowedFields = ["fullName", "email", "mobileNumber", "specification", "yearexp", "certifications", "availability"];
    const sanitizedUpdates = Object.keys(updates)
        .filter((key) => allowedFields.includes(key))
        .reduce((obj, key) => ({ ...obj, [key]: updates[key] }), {});

    // Find and update the counsellor
    const counsellor = await Counsellor.findByIdAndUpdate(
        counsellorId,
        { $set: sanitizedUpdates },
        { new: true, runValidators: true }
    ).select("-password -refreshToken");

    if (!counsellor) {
        throw new ApiError(404, "Counsellor not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { updatedCounsellor: counsellor }, "Profile updated successfully"));
});


