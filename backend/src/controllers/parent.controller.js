import mongoose from "mongoose";
import asyncHandler from "../utils/asynchandler.utils.js";
import {ApiError} from "../utils/API_Error.js";
import { User } from "../models/user.model.js";
import { Parent } from "../models/parent.model.js";
import { OTP } from "../models/otp.model.js";
import { Session } from "../models/session.model.js";
import { Mood } from "../models/mood.model.js";
import ApiResponse from "../utils/API_Response.js";
import { generateAccessAndRefreshTokens, refreshAccessToken } from "./user.controller.js";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import axios from "axios";
import twilio from "twilio"
//import { JsonWebTokenError } from "jsonwebtoken";
dotenv.config();
// OTP generation function
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOTP = async (req, res) => {
    const mobileNumber= req.body.mobileNumber;
    const otp=generateOTP();
    await OTP.create({ mobileNumber, otp, createdAt: new Date() });
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_API_KEY_SECRET;
const Twilio_Number = process.env.TWILIO_NUMBER;
const client = twilio(accountSid, authToken);
try {
    const message = await client.messages.create({
        body: `Your OTP is: ${otp}`, // Use template literals to include OTP
        to: `+91${mobileNumber}`, 
        from: Twilio_Number });

    res.json({ success: true, messageSid: message.sid });
} catch (error) {
    res.status(500).json({ success: false, error: error.message });
}
};
// OTP verification function
const verifyOTP = async (mobileNumber, enteredOTP) => {
    console.log('Searching for OTP with mobile number:', mobileNumber);
    const record = await OTP.findOne({ mobileNumber }).setOptions({ bypassHooks: true }).sort({ createdAt: -1 });
    console.log(record);
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
        const { fullName, email, password, mobileNumber, otp } = req.body;
    
        // Validate fields
        if ([fullName, email, password, mobileNumber, otp].some((field) => field?.trim() === "")) {
            throw new ApiError(400, "All fields are required");
        }
    
        // Check if the mobile number exists in any user's document
        const user = await User.findOne({ parent_phone_no: mobileNumber });
        if (!user) {
            throw new ApiError(400, "Mobile number is not related to any user.");
        }

    // Verify OTP
    const otpVerification = await verifyOTP(mobileNumber, otp);
    if (!otpVerification.success) {
        throw new ApiError(400, otpVerification.message);
    }

    // Check if user already exists
    const existedParent = await Parent.findOne({
        $or: [{ fullName }, { email }],
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
        studentID: user._id,
    });

    user.parent = parent._id; // Assuming the `User` schema has a `parent` field
    await user.save();
    // Send response with created parent
    const createdParent = await Parent.findById(parent._id).select("-password -refreshToken");
    return res.status(201).json(new ApiResponse(200, { createdParent }, "Parent registered successfully"));
});

// Login with OTP authentication
const loginParent = asyncHandler(async (req, res) => {
    const { password, fullName, mobileNumber, otp } = req.body;

    // Validate user credentials
    if (!(mobileNumber&&otp) ){
        throw new ApiError(400, "Mobile & otp is required");
    }
    else{
        const otpVerification = await verifyOTP(mobileNumber, otp);
        if (!otpVerification.success) {
            throw new ApiError(400, otpVerification.message);
        }
    }

    const parent = await Parent.findOne({
        $or: [{ fullName }],
    });
    
    if (!parent) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await parent.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(parent._id);

    const loggedInParent = await User.findById(parent._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true,
    };
    await checkMoodAndNotifyParent(parentId);

    return res.status(200).cookie("accessToken", accessToken, options)
               .cookie("refreshToken", refreshToken, options)
               .json(new ApiResponse(200, { parent: loggedInParent, accessToken, refreshToken }, "Parent logged In Successfully"))
});

// Logout User with OTP authentication (for added security)
const logoutParent = asyncHandler(async (req, res) => {
    const { mobileNumber, otp } = req.body;

    // Validate OTP if provided
    if (mobileNumber && otp) {
        const otpVerification = await verifyOTP(mobileNumber, otp);
        if (!otpVerification.success) {
            throw new ApiError(400, otpVerification.message);
        }
    }

    // Remove refresh token to logout
    await Parent.findByIdAndUpdate(
        req.parent._id,
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

  const getStudentReport = (async (req,res) => {
    const parentId= req.parent._id;
    try {
      // Find the parent and populate associated students
      const parent = await Parent.findById(parentId).populate({
        path: "student", // Populate the students field
        populate: { path: "userId", model: "User" }, // Populate userId in Student
      });
  
      if (!parent) throw new Error("Parent not found");
  
      // Extract userIds from the populated student data
      const userIds = parent.student.map((student) => student.userId._id);
  
      // Fetch data for each userId
      const reports = await Promise.all(
        userIds.map(async (userId) => {
          const user = await User.findById(userId);
          if (!user) throw new Error(`User with ID ${userId} not found`);
  
          // Fetch moods for the past month
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  
          const moods = await Mood.find({
            user: userId,
            timestamp: { $gte: oneMonthAgo },
          });
  
          // Fetch journal entries for the past month
          const journals = await Journal.find({
            user: userId,
            createdAt: { $gte: oneMonthAgo },
          });
  
          // Calculate average mood
          const avgMood =
            moods.reduce((sum, mood) => sum + mood.value, 0) / (moods.length || 1);
  
          // Construct individual report data
          return {
            studentName: user.name,
            avgMood: avgMood.toFixed(2),
            totalJournals: journals.length,
          };
        })
      );
  
      return {
        parentName: parent.name,
        reports,
        generatedAt: new Date(),
      };
    } catch (error) {
      console.error("Error generating report:", error);
      throw new Error("Report generation failed");
    }
   });

 const getSessions= (async (req,res) =>{
    const parentId=req.parent_.id;
    try {
        // Find the student (user) who has this parent
        const student = await User.findOne({ parent: parentId });

        if (!student) {
            return {
                success: false,
                message: "No student found for this parent",
            };
        }

        // Retrieve all sessions for this student's ID
        const sessions = await Session.find({ student: student._id })
            .populate("student", "name email")  // Populating student details
            .populate("counselor", "name expertise")  // Populating counselor details
            .exec();

            res.status(200).json({
                success: true,
                sessions: sessions,
            });
    } catch (error) {
        console.error("Error fetching sessions:", error);
        return {
            success: false,
            message: "Failed to fetch sessions",
            error: error.message,
        };
    }
})

const checkMoodAndNotifyParent = async (req,res) => {
    const parentId=req.parent._id;
    try {
      const student = await User.findOne({ parent: parentId });
      // Fetch mood history for the past 7 days
      const moodHistory = await getUserMoodHistory({student: student._id}, 7);
  
      // Check if all mood scores for the past 7 days are below 1 (Sad or Angry)
      const isMoodLowForEntireWeek = moodHistory.every(mood => moodScores[mood.mood] <= 1);
  
      if (isMoodLowForEntireWeek) {
        // If mood is low for the entire week, trigger a notification for the parent
        const user = await User.findById(student._id).populate('parent'); // Assuming 'parent' is a reference in the User model
  
        if (user && user.parent) {
          const parent = user.parent;
          // Send notification or alert to the parent (can be a message, email, etc.)
          // Example: You can create a notification model, or send an email
          const message= "Your child has had a low mood for the past week. Please check in.";
  
        }
      }
  
      throw new ApiResponse(200, {message}, "Mood verified");
    } catch (error) {
      console.error("Error checking mood history:", error);
      throw new Error("Failed to check mood history");
    }
  };

const getJournals=(async(req,res)=> {
    try {
        const parentId=req.parent._id;
        const student = await User.findOne({ parent: parentId }).populate("journals");

        if (!student) {
            return {
                success: false,
                message: "No student found for this parent",
            };
        }

        // Retrieve all journals for this student
        const journals = student.journals;

        res.status(200).json({
            success: true,
            journals: journals,
        });
    } catch (error) {
        console.error("Error fetching journal entries:", error);
        return {
            success: false,
            message: "Failed to fetch journal entries",
            error: error.message,
        };
    }
})

const getIssues=(async(req,res) =>{
    const parentId= req.parent._id;
    try {
        // Find the student (user) who has this parent
        const student = await User.findOne({ parent: parentId }).populate("issues");

        if (!student) {
            return {
                success: false,
                message: "No student found for this parent",
            };
        }

        // Retrieve all issues for this student
        const issues = student.issues;

        res.status(200).json({
            success: true,
            issues: issues,
        });
    } catch (error) {
        console.error("Error fetching issues:", error);
        return {
            success: false,
            message: "Failed to fetch issues",
            error: error.message,
        };
    }
})

export {
    sendOTP,
    verifyOTP,
    registerParent,
    loginParent,
    logoutParent,
    getStudentReport,
    getSessions, getJournals, getIssues, checkMoodAndNotifyParent
}