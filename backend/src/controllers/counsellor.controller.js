import asyncHandler from "../utils/asynchandler.utils.js";
import {ApiError} from "../utils/API_Error.js";
import ApiResponse from "../utils/API_Response.js";
import { Counsellor } from "../models/counsellor.model.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Session } from "../models/session.model.js";
import { verifyOTP } from "./parent.controller.js";
import app from "../app.js"
import {server,io} from "../index.js"
import nodemailer from "nodemailer";
import { OTP } from "../models/otp.model.js";
import Notification from "../models/notification.model.js";

// Route to check if user is in a sitting series
export const checkSittingSeries = asyncHandler(async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
    }
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
        inSittingSeries: user.inSittingSeries,
        sittingNotes: user.sittingNotes
    });
});

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
    const userId = req.user._id;
    if (!userId || !issueDetails) {
        throw new ApiError(400, "User ID and issue details are required");
    }
    console.log("Requesting session for user:", userId);
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // If user has a previous counselor and chose to change, exclude that counselor from being assigned
    let excludeCounselorIds = [];
    if (user.counselorProgress && Array.isArray(user.counselorProgress)) {
        // Find the last counselor with nonzero sittings
        const lastProgress = user.counselorProgress.find(cp => cp.sittingProgress > 0 && cp.excludeNext === true);
        if (lastProgress) {
            excludeCounselorIds.push(lastProgress.counselor);
        }
    }

    // Find an available counselor, excluding previous if needed
    const counselor = await Counsellor.findOne({ isAvailable: true, _id: { $nin: excludeCounselorIds } });
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
    io.emit(`sessionRequested`, { sessionId: session._id, issueDetails, userId: user.username, timestamp: new Date().toISOString() });
    const counselors = await Counsellor.find({}, "_id");
    await Promise.all(
      counselors.map(counselor =>
        Notification.create({
          counselor: counselor._id,
          type: "session_request",
          title: `New Session Request from ${req.user.fullName || "Student"}`,
          message: `A new session has been requested.`,
          unread: true,
          relatedId: session._id,
        })
      )
    );
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
export const addNotesToSession = async (req, res) => {
    const { sessionId, notes } = req.body;

    if (!sessionId || !notes) {
      return res.status(400).json({ message: "Session ID and notes are required." });
    }
  
    try {
      const session = await Session.findById(sessionId);
  
      if (!session) {
        return res.status(404).json({ message: "Session not found." });
      }
  
      if (session.status !== "Active") {
        return res.status(400).json({ message: "Cannot add notes to a session that is not active." });
      }

      session.userNotes = notes;
      await session.save();
  
      return res.status(200).json({ message: "Notes added successfully!" });
    } catch (error) {
      console.error("Error adding notes:", error);
      return res.status(500).json({ message: "Failed to add notes. Please try again." });
    }
  };

// Accept Session (Counselor Side)
export const acceptSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.body;
    const counselorId = req.counsellor._id;
    
    console.log('✅ Accepting session:', sessionId, 'by counselor:', counselorId);
    
    const counselor = await Counsellor.findById(counselorId);
    const session = await Session.findById(sessionId);
    
    if (!session) {
        throw new ApiError(404, "Session not found");
    }

    if (session.status !== "Pending") {
        throw new ApiError(400, "Session is not in pending state");
    }
    
    // Update session
    session.counselor = counselorId;
    session.status = "Active";
    session.startTime = new Date();
    
    // Generate WebRTC room name (using session ID for uniqueness)
    session.roomName = `session-${sessionId}-${Date.now()}`;
    
    await session.save();

    // Mark counselor as unavailable
    counselor.isAvailable = false;
    await counselor.save();

    console.log('🏠 WebRTC room created:', session.roomName);
    console.log('📞 Session activated:', sessionId);

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
    
    if (!req.isCounsellor) {
        userId = req.user._id;
    } else {
        userId = req.counsellor._id;
    }
    
    console.log('🔚 Ending session:', sessionId, 'by user:', userId);
    
    const session = await Session.findById(sessionId);
    if (!session) {
        throw new ApiError(404, "Session not found");
    }
    
    // Verify that the user ending the session is either the counselor or the user
    if (![session.counselor.toString(), session.user.toString()].includes(userId.toString())) {
        throw new ApiError(403, "Not authorized to end this session");
    }
    
    // Update session status
    session.status = "Completed";
    session.endTime = new Date();
    
    // Calculate duration
    if (session.startTime) {
        session.duration = Math.round((session.endTime - session.startTime) / 1000); // duration in seconds
    }
    
    await session.save();
    console.log('⏱️ Session duration:', session.duration, 'seconds');

    // Handle user progress and sitting series logic
    const user = await User.findById(session.user);
    let sittingSeriesJustEnded = false;
    
    if (user) {
        // Find the latest counselor review with needsSittings and recommendedSittings
        const lastReview = (user.counsellorReviews || []).slice().reverse().find(r => r.needsSittings && r.recommendedSittings > 0);
        
        if (lastReview) {
            // Update or add to counselorProgress
            let progressArr = user.counselorProgress || [];
            let found = false;
            
            for (let cp of progressArr) {
                if (cp.counselor.toString() === session.counselor.toString()) {
                    cp.sittingProgress = (cp.sittingProgress || 0) + 1;
                    cp.lastSession = new Date();
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                progressArr.push({
                    counselor: session.counselor,
                    sittingProgress: 1,
                    lastSession: new Date(),
                    excludeNext: false
                });
            }
            
            // Sum all sittingProgress
            const totalSittings = progressArr.reduce((sum, cp) => sum + (cp.sittingProgress || 0), 0);
            
            if (totalSittings >= lastReview.recommendedSittings) {
                // Sittings completed, clear progress and mark as not in series
                user.counselorProgress = [];
                user.inSittingSeries = false;
                user.sittingNotes = '';
                sittingSeriesJustEnded = true;
                console.log('🎯 Sitting series completed for user:', user._id);
            } else {
                user.counselorProgress = progressArr;
                user.inSittingSeries = true;
                console.log('📈 Sitting progress updated:', totalSittings, '/', lastReview.recommendedSittings);
            }
        } else {
            user.inSittingSeries = false;
            user.sittingNotes = '';
        }
        
        // Update session progress
        if (user.sessionProgress && user.sessionProgress > 0) {
            user.sessionProgress -= 1;
        }
        
        await user.save();
    }

    // Emit session ended event to all participants
    io.emit(`sessionEnded-${sessionId}`, { 
        sessionId,
        roomName: session.roomName,
        endedBy: userId 
    });
    
    console.log('📡 Session ended event emitted for session:', sessionId);
    // Make counselor available again
    const counselor = await Counsellor.findById(session.counselor);
    if (counselor) {
        counselor.isAvailable = true;
        await counselor.save();
        
        // Notify counselor if sittings are now 0
        if (sittingSeriesJustEnded) {
            io.emit(`sittingSeriesEnded-${counselor._id}`, { 
                userId: user._id, 
                message: 'Sittings recommended are now 0.' 
            });
        }
        
        console.log('✅ Counselor marked as available:', counselor._id);
    }

    res.status(200).json({
        success: true,
        message: "Session ended successfully",
        user: user ? { 
            userId: user._id, 
            sessionProgress: user.sessionProgress, 
            fullName: user.fullName, 
            inSittingSeries: user.inSittingSeries, 
            sittingNotes: user.sittingNotes 
        } : null,
        duration: session.duration || null,
        roomName: session.roomName // Include room name for cleanup
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

// Helper to send code via email
const sendCodeByEmail = async (email, code) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your MindFull Login Code',
    text: `Your login code is: ${code}`,
  });
};

// Login Counsellor
export const loginCounsellor = asyncHandler(async (req, res) => {
    const { password, email, mobileNumber, otp, code } = req.body;

    // Option 1: Login with mobile + OTP
    if (mobileNumber && otp) {
      const otpVerification = await verifyOTP(mobileNumber, otp);
      if (!otpVerification.success) {
        throw new ApiError(400, otpVerification.message);
      }
      const counsellor = await Counsellor.findOne({ mobileNumber });
      if (!counsellor) {
        throw new ApiError(404, "User does not exist");
      }
      counsellor.isAvailable = true;
      await counsellor.save();
      const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(counsellor._id);
      const loggedInCounsellor = await Counsellor.findById(counsellor._id).select("-password -refreshToken");
      const options = { httpOnly: true, secure: true };
      return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { user: loggedInCounsellor, accessToken, refreshToken }, "User logged in successfully"));
    }

    // Option 2: Login with email + code
    if (email && code) {
      // Find the code in DB (reuse OTP model for code)
      const record = await OTP.findOne({ email }).setOptions({ bypassHooks: true }).sort({ createdAt: -1 });
      if (!record || record.otp !== code) {
        throw new ApiError(400, "Invalid code");
      }
      const isExpired = (new Date() - record.createdAt) > 5 * 60 * 1000;
      if (isExpired) {
        throw new ApiError(400, "Code expired");
      }
      const counsellor = await Counsellor.findOne({ email });
      if (!counsellor) {
        throw new ApiError(404, "User does not exist");
      }
      counsellor.isAvailable = true;
      await counsellor.save();
      const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(counsellor._id);
      const loggedInCounsellor = await Counsellor.findById(counsellor._id).select("-password -refreshToken");
      const options = { httpOnly: true, secure: true };
      return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { user: loggedInCounsellor, accessToken, refreshToken }, "User logged in successfully"));
    }

    throw new ApiError(400, "Provide either mobile+otp or email+code");
});

// Send code via email
export const sendEmailCode = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, "Email is required");
  }
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  await OTP.create({ email, otp: code, createdAt: new Date() });
  await sendCodeByEmail(email, code);
  res.json({ success: true, message: "Code sent to email" });
});
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

// Controller to get notifications for a counselor
export const getCounsellorNotifications = async (req, res) => {
  try {
    const counselorId = req.counsellor._id;
    const notifications = await Notification.find({ counselor: counselorId })
      .sort({ createdAt: -1 });

    // Always return an array
    res.status(200).json(Array.isArray(notifications) ? notifications : []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
};

export const updateFeedback = asyncHandler(async (req, res) => {
    const counsellorId = req.counsellor._id;
    const { feedback, sessionId } = req.body;

    // Validate inputs
    if (!counsellorId || !feedback?.trim()) {
        throw new ApiError(400, "Counsellor ID and feedback are required");
    }

    // Find the counsellor and update feedback
    const counsellor = await Counsellor.findById(counsellorId);
    if (!counsellor) {
        throw new ApiError(404, "Counsellor not found");
    }
    const session=Session.findById(sessionId);
    session.counsellorFeedback.push(feedback);
    await session.save();

    return res
        .status(200)
        .json(new ApiResponse(200, { feedback: session.counsellorFeedback }, "Feedback updated successfully"));
});
// getStats 
export const getCounselorStats = async (req, res) => {
    try {
        const counselorId = req.counsellor._id  // counselorId is passed as a URL parameter

        // Find the counselor by ID
        const counselor = await Counsellor.findById(counselorId);
        
        if (!counselor) {
            return res.status(404).json({ message: "Counselor not found" });
        }

        // Get the number of sessions the counselor has taken
        const sessionsCount = await Session.countDocuments({ counselor: counselorId });

        // Optionally, calculate other stats like total session duration (if you want to)
        const sessions = await Session.find({ counselor: counselorId });
        const totalSessionDuration = sessions.reduce((total, session) => {
            const duration = new Date(session.endTime) - new Date(session.startTime);
            return total + duration;
        }, 0);

        // Format total session duration to hours, minutes, etc.
        const totalDurationHours = Math.floor(totalSessionDuration / 3600000);  // Convert ms to hours
        const totalDurationMinutes = Math.floor((totalSessionDuration % 3600000) / 60000);  // Convert remaining ms to minutes

        // Return the stats as a response
        return res.status(200).json({
            counselorName: counselor.fullName,
            sessionsTaken: sessionsCount,
            totalSessionDuration: `${totalDurationHours} hours ${totalDurationMinutes} minutes`
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

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
// Add Review to Session (Counselor Review)
export const addCounsellorReview = asyncHandler(async (req, res) => {
    const { sessionId, userId, diagnosis, symptoms, needsSittings, recommendedSittings, willingToTreat, notes, sittingNotes, curedSittingReason } = req.body;
    if (!sessionId || !userId || !diagnosis) {
        return res.status(400).json({ message: "Session ID, user ID, and diagnosis are required." });
    }
    const session = await Session.findById(sessionId);
    if (!session) {
        return res.status(404).json({ message: "Session not found." });
    }
    // Attach review fields to session
    session.counsellorReview = {
        diagnosis,
        symptoms,
        needsSittings,
        recommendedSittings,
        willingToTreat,
        notes,
        sittingNotes,
        curedSittingReason,
        reviewedAt: new Date()
    };
    await session.save();

    // Also push review to user's counsellorReviews array
    const user = await User.findById(userId);
    if (user) {
        user.counsellorReviews = user.counsellorReviews || [];
        user.counsellorReviews.push({
            sessionId,
            counselorId: session.counselor,
            diagnosis,
            symptoms,
            needsSittings,
            recommendedSittings,
            willingToTreat,
            notes,
            sittingNotes,
            curedSittingReason,
            reviewedAt: new Date()
        });
        // Update user sittingNotes and inSittingSeries
        if (needsSittings && recommendedSittings > 0) {
            // If counselor says user is cured, clear sittingNotes and mark not in series
            if (curedSittingReason) {
                user.sittingNotes = [];
                user.inSittingSeries = false;
            } else {
                // Not cured, append sittingNotes if provided
                if (sittingNotes && sittingNotes.trim()) {
                    if (!Array.isArray(user.sittingNotes)) user.sittingNotes = [];
                    user.sittingNotes.push(sittingNotes.trim());
                }
                user.inSittingSeries = true;
            }
        } else {
            user.sittingNotes = [];
            user.inSittingSeries = false;
        }
        await user.save();
    }
    return res.status(200).json({ message: "Review submitted successfully!" });
});

// Dashboard Stats for Counsellor
export const getCounsellorDashboardStats = asyncHandler(async (req, res) => {
    const counsellorId = req.counsellor._id;
    const counsellor = await Counsellor.findById(counsellorId);
    if (!counsellor) {
        return res.status(404).json({ message: "Counsellor not found" });
    }
    // Sessions taken (completed)
    const sessionsTaken = await Session.countDocuments({ counselor: counsellorId, status: "Completed" });
    // Upcoming sessions (today, status Active or Pending)
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const upcomingSessions = await Session.countDocuments({
        counselor: counsellorId,
        status: { $in: ["Pending", "Active"] },
        startTime: { $gte: today, $lt: tomorrow }
    });
    // Average session rating
    const sessionsWithRating = await Session.find({ counselor: counsellorId, rating: { $gt: 0 } });
    const avgSessionRating = sessionsWithRating.length > 0 ?
        (sessionsWithRating.reduce((sum, s) => sum + s.rating, 0) / sessionsWithRating.length).toFixed(1) : 0;
    // Total hours (sum of durations in hours)
    const completedSessions = await Session.find({ counselor: counsellorId, status: "Completed" });
    const totalHours = (completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 3600).toFixed(1);
    res.status(200).json({
        counselorName: counsellor.fullName,
        sessionsTaken,
        upcomingSessions,
        avgSessionRating,
        totalHours
    });
});

// Get Counselor Profile
export const getCounselorProfile = asyncHandler(async (req, res) => {
    const counselorId = req.counsellor._id;
    const counselor = await Counsellor.findById(counselorId).select("-password -refreshToken");
    
    if (!counselor) {
        throw new ApiError(404, "Counselor not found");
    }

    const defaultProfilePic = "https://api.dicebear.com/7.x/avataaars/svg"; // Fallback avatar
    
    return res.status(200).json({
        success: true,
        counselor: {
            ...counselor.toObject(),
            profilePic: counselor.profilePic || defaultProfilePic
        }
    });
});

// Mark a single notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      id,
      { unread: false },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Notification marked as read", notification });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
};

// Mark all notifications as read for a counselor
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const counselorId = req.counselor._id; // from JWT middleware
    await Notification.updateMany(
      { counselor: counselorId, unread: true },
      { unread: false }
    );

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to mark all notifications as read" });
  }
};

// Accept a session/appointment request
export const acceptNotificationRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.unread = false;
    notification.accepted = true;
    notification.rejected = false;
    await notification.save();

    res.status(200).json({ message: "Request accepted", notification });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to accept request" });
  }
};

// Reject a session/appointment request
export const rejectNotificationRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.unread = false;
    notification.accepted = false;
    notification.rejected = true;
    await notification.save();

    res.status(200).json({ message: "Request rejected", notification });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to reject request" });
  }
};
