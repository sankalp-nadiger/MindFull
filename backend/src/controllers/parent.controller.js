// Fetch all parent-counselor meetings for the logged-in parent
const getParentCounselorMeetings = async (req, res) => {
    const parentId = req.parent._id;
    try {
        const parent = await Parent.findById(parentId).populate({
            path: 'parentCounselorMeetings.counselor',
            select: 'fullName email specialization',
        });
        if (!parent) {
            return res.status(404).json({ success: false, message: 'Parent not found' });
        }
        return res.status(200).json({ success: true, meetings: parent.parentCounselorMeetings });
    } catch (error) {
        console.error('Error fetching parent-counselor meetings:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch meetings', error: error.message });
    }
};
import mongoose from "mongoose";
import asyncHandler from "../utils/asynchandler.utils.js";
import {ApiError} from "../utils/API_Error.js";
import { User } from "../models/user.model.js";
import { Parent } from "../models/parent.model.js";
import { OTP } from "../models/otp.model.js";
import { Session } from "../models/session.model.js";
import { Mood } from "../models/mood.model.js";
import { Journal } from "../models/journal.model.js";
import ApiResponse from "../utils/API_Response.js";
//import { generateAccessAndRefreshTokens, refreshAccessToken } from "./user.controller.js";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import axios from "axios";
import twilio from "twilio"
//import { JsonWebTokenError } from "jsonwebtoken";
dotenv.config();
// OTP generation function
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOTP = async (req, res) => {
    console.log('Received request to send OTP:', req.body);
    const mobileNumber= req.body.mobileNumber;
    const otp=generateOTP();
    console.log('Generated OTP:', otp, 'for mobile number:', mobileNumber);
    await OTP.create({ mobileNumber, otp, createdAt: new Date() });
    const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const Twilio_Number = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

client.api.accounts(accountSid).fetch()
  .then(account => console.log('Twilio credentials valid:', account.friendlyName))
  .catch(err => console.error('Twilio auth failed:', err.message));

try {
    const message = await client.messages.create({
        body: `Your OTP is: ${otp}`, 
        to: `+91${mobileNumber}`, 
        from: Twilio_Number });

    res.json({ success: true, messageSid: message.sid });
}
//  try {
//     const response = await axios.get("https://www.fast2sms.com/dev/bulkV2", {
//       params: {
//         route: "v3",
//         api_key: process.env.FAST2SMS_API_KEY,
//         numbers: mobileNumber,
//         message: `Your OTP is ${otp}. Do not share with anyone.`,
//         flash: 0
//       }
//     });
//     if (response.data.return) {
//       console.log("Fast2SMS success:", response.data);
//       return res.json({ success: true, provider: "Fast2SMS" });
//     } else {
//       console.error("Fast2SMS error:", response.data);
//       return res.status(500).json({ success: false, error: response.data });
//     }
// }
 catch (error) {
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
const generateAccessAndRefreshTokens = async (userId) => {
    try {
      const parent = await Parent.findById(userId);
      if (!parent) {
        throw new ApiError(404, "User not found");
      }
  
      console.log("User found:", parent); // Log user to verify it's fetched correctly
  
      const accessToken = parent.generateAccessToken();
      const refreshToken = parent.generateRefreshToken();
  
      console.log("Access token:", accessToken); // Log tokens for debugging
      console.log("Refresh token:", refreshToken);
  
      parent.refreshToken = refreshToken; // Store the refresh token in the user document
      await parent.save({ validateBeforeSave: false });
  
      return { accessToken, refreshToken };
    } catch (error) {
      console.error("Error generating tokens:", error); // Log the error for debugging
      throw new ApiError(
        500,
        "Something went wrong while generating refresh and access token"
      );
    }
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
        $or: [{ fullName }],
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
        mobileNumber,
        password,
        student: user._id,
    });

    user.parent = parent._id; // Assuming the `User` schema has a `parent` field
    await user.save();
    // Send response with created parent
    const createdParent = await Parent.findById(parent._id).select("-password -refreshToken");
    return res.status(201).json(new ApiResponse(200, { createdParent }, "Parent registered successfully"));
});

// Login with OTP authentication
const loginParent = asyncHandler(async (req, res) => {
    const {mobileNumber, otp } = req.body;

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
        $or: [{ mobileNumber }],
    });
    
    if (!parent) {
        throw new ApiError(404, "User does not exist");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(parent._id);

    const loggedInParent = await User.findById(parent._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true,
    };
    //await checkMoodAndNotifyParent(parent._id);

    return res.status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json({
    statusCode: 200,
    success: true,
    message: "Parent logged In Successfully",
    data: {
      parent: loggedInParent,
      accessToken,
      refreshToken
    }
  });

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

const moodScores = {
    Happy: 5,
    Excited: 4,
    Tired: 3,
    Anxious: 2,
    Sad: 1,
    Angry: 0,
  };

const getStudentReport = async (req, res) => {
    const parentId = req.parent._id;
    try {
      const parent = await Parent.findById(parentId).populate("student", "fullName email");
  
      if (!parent) throw new ApiError(404, "Parent not found");
      if (!parent.student) throw new ApiError(404, "No student linked to this parent");
  
      const userId = parent.student._id;
      if (!userId) throw new ApiError(404, "User not found for this student");
  
      // ✅ Fix: Ensure timestamps cover the last month properly
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      oneMonthAgo.setHours(0, 0, 0, 0); // Start of that day
  
      // ✅ Fetch moods ensuring timestamps are correct
      const moods = await Mood.find({
        user: userId,
        timestamp: { $gte: oneMonthAgo, $lte: today }, // Include today & yesterday
      });
      console.log(moods)
      // ✅ Fetch journal entries with corrected timestamps
      const journals = await Journal.find({
        user: userId,
        createdAt: { $gte: oneMonthAgo, $lte: today },
      });
  
      // ✅ Fix: Ensure avgMood is calculated correctly
      let avgMood = 0;
       if (moods.length > 0) {
      const totalMoodScore = moods.reduce((sum, mood) => sum + (moodScores[mood.mood] || 0), 0);
      avgMood = totalMoodScore / moods.length;
    }
  
      // Construct report
      const report = {
        parentName: parent.fullName,
        studentName: parent.student.fullName,
        avgMood: avgMood.toFixed(2), // Proper decimal format
        totalJournals: journals.length,
        generatedAt: new Date(),
      };
      console.log(report)
      res.status(200).json(new ApiResponse(200, report, "Student report generated successfully"));
    } catch (error) {
      console.error("Error generating report:", error);
      res.status(500).json(new ApiResponse(500, null, "Report generation failed"));
    }
  };

  const getSessions = async (req, res) => {
    const parentId = req.parent._id;
    try {
        // Find the student (user) associated with this parent
        const student = await User.findOne({ parent: parentId });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "No student found for this parent",
            });
        }

        // Retrieve only "Completed" sessions for this student's ID
        const sessions = await Session.find({ user: student._id, status: "Completed" })
            .populate("counselor", "fullName specification") // Populate counselor details
            .exec();

        if (!sessions || sessions.length === 0) {
            return res.status(200).json({
                success: true,
                sessions: [],
            });
        }

        // Formatting session response
        const formattedSessions = sessions.map(session => ({
            _id: session._id,
            counselorName: session.counselor?.fullName || "Unknown",
            counselorSpecification: session.counselor?.specification || "N/A",
            counselorFeedback: session.counselorFeedback || "No feedback",
            issueDetails: session.issueDetails || "No details provided",
            status: session.status,
            createdAt: session.createdAt
        }));

        res.status(200).json({
            success: true,
            sessions: formattedSessions,
        });

    } catch (error) {
        console.error("Error fetching sessions:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch sessions",
            error: error.message,
        });
    }
};


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

  const getJournals = async (req, res) => {
    try {
        const parentId = req.parent._id;
        
        // First find the student
        const student = await User.findOne({ parent: parentId });
        
        if (!student) {
            return res.status(404).json({
                success: false,
                message: "No student found for this parent",
            });
        }

        // Directly query the journals collection
        const journals = await Journal.find({ user: student._id });
        console.log("Direct journal query result:", journals);

        res.status(200).json({
            success: true,
            journals: journals
        });
    } catch (error) {
        console.error("Error fetching journal entries:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch journal entries",
            error: error.message,
        });
    }
};
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

// Get critical alerts for parent's student (e.g., low mood, high severity issues)
const getCriticalAlerts = async (req, res) => {
    const parentId = req.parent._id;
    try {
        const student = await User.findOne({ parent: parentId }).populate('issues');
        if (!student) {
            return res.status(404).json({ success: false, alerts: [] });
        }
        const alerts = [];
        // Check for high severity issues
        if (student.issues && student.issues.length > 0) {
            student.issues.forEach(issue => {
                if (issue.severity === 'High') {
                    alerts.push({
                        id: issue._id,
                        type: 'urgent',
                        message: `High severity issue: ${issue.illnessType}`,
                        timestamp: issue.createdAt || new Date(),
                    });
                }
            });
        }
        // Check for low mood in last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const moods = await Mood.find({ user: student._id, timestamp: { $gte: sevenDaysAgo } });
        const lowMoods = moods.filter(m => m.mood === 'Sad' || m.mood === 'Angry');
        if (lowMoods.length >= 5) {
            alerts.push({
                id: 'mood-low',
                type: 'warning',
                message: "Your child's mood has been low for several days.",
                timestamp: new Date(),
            });
        }
        return res.status(200).json({ success: true, alerts });
    } catch (error) {
        console.error('Error fetching critical alerts:', error);
        return res.status(500).json({ success: false, alerts: [], error: error.message });
    }
};

// Get upcoming counseling sessions for parent's student
const getUpcomingSessions = async (req, res) => {
    const parentId = req.parent._id;
    try {
        const student = await User.findOne({ parent: parentId });
        if (!student) {
            return res.status(404).json({ success: false, sessions: [] });
        }
        const sessions = await Session.find({ user: student._id, status: 'Scheduled' })
            .populate('counselor', 'fullName specification')
            .exec();
        const formatted = sessions.map(session => ({
            id: session._id,
            counselor: session.counselor?.fullName || 'Unknown',
            type: session.counselor?.specification || 'N/A',
            date: session.date ? session.date.toISOString().split('T')[0] : '',
            time: session.time || '',
        }));
        return res.status(200).json({ success: true, sessions: formatted });
    } catch (error) {
        console.error('Error fetching upcoming sessions:', error);
        return res.status(500).json({ success: false, sessions: [], error: error.message });
    }
};

// Request a counselor meeting
const requestCounselorMeeting = async (req, res) => {
    const parentId = req.parent._id;
    const { counselorId, preferredDate, preferredTime, reason } = req.body;
    try {
        // Add the meeting request to the parent's parentCounselorMeetings array
        const parent = await Parent.findById(parentId);
        if (!parent) {
            return res.status(404).json({ success: false, message: 'Parent not found' });
        }
        const meeting = {
            counselor: counselorId,
            date: preferredDate,
            time: preferredTime,
            reason,
            status: 'Requested',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        parent.parentCounselorMeetings.push(meeting);
        await parent.save();
        return res.status(201).json({ success: true, message: 'Counselor meeting requested', meeting });
    } catch (error) {
        console.error('Error requesting counselor meeting:', error);
        return res.status(500).json({ success: false, message: 'Failed to request counselor meeting', error: error.message });
    }
};

export {
    sendOTP,
    verifyOTP,
    registerParent,
    loginParent,
    logoutParent,
    getStudentReport,
    getSessions, getJournals, getIssues, checkMoodAndNotifyParent,
    getCriticalAlerts,
    getUpcomingSessions,
    requestCounselorMeeting,
    getParentCounselorMeetings,
}