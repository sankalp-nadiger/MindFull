import mongoose from "mongoose";
import asyncHandler from "../utils/asynchandler.utils.js";
import ApiError from "../utils/API_Error.js";
import { User } from "../models/user.model.js";
import { Parent } from "../models/parent.model.js";
import { OTP } from "../models/otp.model.js";
import ApiResponse from "../utils/API_Response.js";
import { generateAccessAndRefreshTokens, refreshAccessToken } from "./user.controller.js";
import jwt from "jsonwebtoken";
import { JsonWebTokenError } from "jsonwebtoken";

// OTP generation function
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Function to send OTP via Twilio (or other services)
const sendOTP = async (mobileNumber) => {
    const otp = generateOTP();
    // Save OTP to database (with expiry)
    await OTP.create({ mobileNumber, otp, createdAt: new Date() });

    // Send OTP using Twilio
    const accountSid = 'your-twilio-account-sid';
    const authToken = 'your-twilio-auth-token';
    const client = require('twilio')(accountSid, authToken);

    await client.messages.create({
        body: `Your OTP is ${otp}`,
        from: '+1234567890', // Your Twilio number
        to: mobileNumber,
    });
};

// OTP verification function
const verifyOTP = async (mobileNumber, enteredOTP) => {
    const record = await OTP.findOne({ mobileNumber }).sort({ createdAt: -1 });

    if (!record || record.otp !== enteredOTP) {
        return { success: false, message: 'Invalid OTP' };
    }

    const isExpired = (new Date() - record.createdAt) > 5 * 60 * 1000; // 5 minutes expiry
    if (isExpired) {
        return { success: false, message: 'OTP expired' };
    }

    return { success: true, message: 'OTP verified' };
};

// Parent Registration with OTP authentication
const registerParent = asyncHandler(async (req, res) => {
    const { fullName, email, username, password, studentID, mobileNumber, otp } = req.body;

    // Validate fields
    if ([fullName, email, password, mobileNumber, otp].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    // Verify OTP
    const otpVerification = await verifyOTP(mobileNumber, otp);
    if (!otpVerification.success) {
        throw new ApiError(400, otpVerification.message);
    }

    // Check if user already exists
    const existedParent = await Parent.findOne({
        $or: [{ username }, { email }],
    });

    if (existedParent) {
        throw new ApiError(409, "User with email or username already exists");
    }

    // Set profile avatar (optional)
  //  const profileImgUrl = 'some-default-avatar-url'; // Can use default avatar URL

    // Create the user
    const parent = await Parent.create({
        fullName,
        email,
        password,
        studentID,
        interests: [],
    });

    // Send response with created user
    const createdUser = await Parent.findById(parent._id).select("-password -refreshToken");
    return res.status(201).json(new ApiResponse(200, { createdUser }, "User registered successfully"));
});

// Login with OTP authentication
const loginUser = asyncHandler(async (req, res) => {
    const { username, password, email, mobileNumber, otp } = req.body;

    // Validate OTP if mobile number is provided
    if (mobileNumber && otp) {
        const otpVerification = await verifyOTP(mobileNumber, otp);
        if (!otpVerification.success) {
            throw new ApiError(400, otpVerification.message);
        }
    }

    // Validate user credentials
    if (!username && !email) {
        throw new ApiError(400, "Username or Email is required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }],
    });
    
    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res.status(200).cookie("accessToken", accessToken, options)
               .cookie("refreshToken", refreshToken, options)
               .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged In Successfully"));
});

// Logout User with OTP authentication (for added security)
const logoutUser = asyncHandler(async (req, res) => {
    const { mobileNumber, otp } = req.body;

    // Validate OTP if provided
    if (mobileNumber && otp) {
        const otpVerification = await verifyOTP(mobileNumber, otp);
        if (!otpVerification.success) {
            throw new ApiError(400, otpVerification.message);
        }
    }

    // Remove refresh token to logout
    await User.findByIdAndUpdate(
        req.user._id,
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

    return res.status(200)
              .clearCookie("accessToken", options)
              .clearCookie("refreshToken", options)
              .json(new ApiResponse(200, {}, "User logged Out"));
});

export {
    registerParent,
    loginUser,
    logoutUser
}