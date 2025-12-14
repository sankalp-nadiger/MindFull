import asyncHandler from "../utils/asynchandler.utils.js";
import {ApiError} from "../utils/API_Error.js";
import ApiResponse from "../utils/API_Response.js";
import { Counsellor } from "../models/counsellor.model.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Session } from "../models/session.model.js";
import { verifyOTP } from "./parent.controller.js";
import moment from "moment";
import { Appointment } from "../models/appointment.model.js";
import {server,io} from "../index.js"
import nodemailer from "nodemailer";
import { OTP } from "../models/otp.model.js";
import Notification from "../models/notification.model.js";
import twilio from 'twilio';

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// Route to check if user is in a sitting series
export const checkSittingSeries = asyncHandler(async (req, res) => {
    const { userId } = req.query;
    const counselorId = req.counsellor._id;
    
    if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Find the latest counselor review with needsSittings and recommendedSittings
        const lastReview = (user.counsellorReviews || []).slice().reverse().find(r => 
            r.needsSittings && 
            r.recommendedSittings > 0 && 
            r.counselorId.toString() === counselorId.toString()
        );

        if (!lastReview || !user.inSittingSeries) {
            return res.status(200).json({
                inSittingSeries: false,
                sittingNotes: '',
                currentSittingNumber: 0,
                totalRecommendedSittings: 0
            });
        }

        // Calculate current sitting number based on counselorProgress
        const progressArr = user.counselorProgress || [];
        let totalSittingsCompleted = 0;

        // Sum all sittingProgress from different counselors
        for (let cp of progressArr) {
            totalSittingsCompleted += (cp.sittingProgress || 0);
        }

        // Current sitting number is the next one (completed + 1)
        const currentSittingNumber = totalSittingsCompleted + 1;
        const totalRecommendedSittings = lastReview.recommendedSittings;

        // Handle session adjustments if any
        let adjustedTotalSittings = totalRecommendedSittings;
        
        // Check if there are any recent reviews with session adjustments
        const recentReviews = (user.counsellorReviews || [])
            .filter(r => r.counselorId.toString() === counselorId.toString())
            .sort((a, b) => new Date(b.reviewedAt) - new Date(a.reviewedAt));
        
        const latestReviewWithAdjustment = recentReviews.find(r => 
            r.adjustSittings && r.adjustSittings !== 'maintain' && r.adjustedSittingsCount
        );
        
        if (latestReviewWithAdjustment) {
            adjustedTotalSittings = latestReviewWithAdjustment.adjustedSittingsCount;
        }

        return res.status(200).json({
            inSittingSeries: user.inSittingSeries,
            sittingNotes: Array.isArray(user.sittingNotes) ? user.sittingNotes.join('\n') : (user.sittingNotes || ''),
            currentSittingNumber: Math.min(currentSittingNumber, adjustedTotalSittings),
            totalRecommendedSittings: adjustedTotalSittings,
            originalRecommendedSittings: totalRecommendedSittings,
            totalCompletedSittings: totalSittingsCompleted
        });

    } catch (error) {
        console.error('Error checking sitting series:', error);
        return res.status(500).json({ message: "Internal server error" });
    }
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

  export const rejoinSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.body;
    const counselorId = req.counsellor._id;
    
    if (!sessionId) {
        return res.status(400).json({ message: "Session ID is required" });
    }

    try {
        // Find the session and populate appointment details for time validation
        const session = await Session.findById(sessionId).populate('user counselor');
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        // Verify that the counselor is assigned to this session
        if (session.counselor._id.toString() !== counselorId.toString()) {
            return res.status(403).json({ message: "Not authorized to rejoin this session" });
        }

        // Check if session has a room name
        if (!session.roomName) {
            return res.status(400).json({ message: "Session room not available" });
        }

        // Ensure session is marked as Active when rejoining
        if (session.status === 'Pending' || session.status === 'Completed') {
            session.status = 'Active';
            await session.save();
        }

        // Log the rejoin attempt
        console.log('🔄 Counselor rejoining session:', {
            sessionId,
            counselorId,
            roomName: session.roomName,
            status: session.status
        });

        // Return session data for rejoining
        res.status(200).json({
            success: true,
            message: "Session ready to rejoin",
            session: {
                _id: session._id,
                roomName: session.roomName,
                status: session.status,
                user: session.user,
                counselor: session.counselor
            }
        });

    } catch (error) {
        console.error('Error rejoining session:', error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Accept Session (Counselor Side)
export const acceptSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.body;
    const counselorId = req.counsellor._id;
    
    console.log('✅ Accepting/Rejoining session:', sessionId, 'by counselor:', counselorId);
    
    const counselor = await Counsellor.findById(counselorId);
    const session = await Session.findById(sessionId);
    
    if (!session) {
        throw new ApiError(404, "Session not found");
    }

    // If session is already Active and this counselor is assigned, treat it as rejoin
    if (session.status === "Active" && session.counselor.toString() === counselorId.toString()) {
        console.log('🔄 Session already active, rejoining...');
        
        if (!session.roomName) {
            throw new ApiError(400, "Session room not available");
        }

        return res.status(200).json({
            success: true,
            message: "Rejoining active session",
            session: {
                _id: session._id,
                roomName: session.roomName,
                status: "Active",
            }
        });
    }

    // Original logic for Pending sessions
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
            
            // Check for session adjustments
            let adjustedTotalSittings = lastReview.recommendedSittings;
            const recentReviews = (user.counsellorReviews || [])
                .filter(r => r.counselorId && r.counselorId.toString() === session.counselor.toString())
                .sort((a, b) => new Date(b.reviewedAt) - new Date(a.reviewedAt));
            
            const latestReviewWithAdjustment = recentReviews.find(r => 
                r.adjustSittings && r.adjustSittings !== 'maintain' && r.adjustedSittingsCount
            );
            
            if (latestReviewWithAdjustment) {
                adjustedTotalSittings = latestReviewWithAdjustment.adjustedSittingsCount;
            }
            
            if (totalSittings >= adjustedTotalSittings) {
                // Sittings completed, clear progress and mark as not in series
                user.counselorProgress = [];
                user.inSittingSeries = false;
                user.sittingNotes = '';
                sittingSeriesJustEnded = true;
                console.log('🎯 Sitting series completed for user:', user._id);
            } else {
                user.counselorProgress = progressArr;
                user.inSittingSeries = true;
                console.log('📈 Sitting progress updated:', totalSittings, '/', adjustedTotalSittings);
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

    // Calculate sitting series info for response
    let sittingSeriesInfo = {
        inSittingSeries: false,
        currentSittingNumber: 0,
        totalRecommendedSittings: 0
    };

    if (user && user.inSittingSeries) {
        const progressArr = user.counselorProgress || [];
        const totalSittingsCompleted = progressArr.reduce((sum, cp) => sum + (cp.sittingProgress || 0), 0);
        
        const lastReview = (user.counsellorReviews || []).slice().reverse().find(r => r.needsSittings && r.recommendedSittings > 0);
        let adjustedTotalSittings = lastReview?.recommendedSittings || 0;
        
        const recentReviews = (user.counsellorReviews || [])
            .filter(r => r.counselorId && r.counselorId.toString() === session.counselor.toString())
            .sort((a, b) => new Date(b.reviewedAt) - new Date(a.reviewedAt));
        
        const latestReviewWithAdjustment = recentReviews.find(r => 
            r.adjustSittings && r.adjustSittings !== 'maintain' && r.adjustedSittingsCount
        );
        
        if (latestReviewWithAdjustment) {
            adjustedTotalSittings = latestReviewWithAdjustment.adjustedSittingsCount;
        }

        sittingSeriesInfo = {
            inSittingSeries: true,
            currentSittingNumber: Math.min(totalSittingsCompleted + 1, adjustedTotalSittings),
            totalRecommendedSittings: adjustedTotalSittings
        };
    }

    res.status(200).json({
        success: true,
        message: "Session ended successfully",
        user: user ? { 
            userId: user._id, 
            sessionProgress: user.sessionProgress, 
            fullName: user.fullName, 
            inSittingSeries: user.inSittingSeries, 
            sittingNotes: user.sittingNotes,
            ...sittingSeriesInfo
        } : null,
        duration: session.duration || null,
        roomName: session.roomName
    });
});

// Get Active Sessions (Counselor Side)
export const getActiveSessions = asyncHandler(async (req, res) => {
  const counselorId = req.counsellor._id;

  // Step 1: Get all accepted notifications for this counselor
  const acceptedNotifications = await Notification.find({
    counselor: counselorId,
    type: 'session_request',
    accepted: true,
  }).select('relatedId');

  const acceptedSessionIds = acceptedNotifications.map(n => n.relatedId);

  // Step 2: Fetch only sessions whose IDs match accepted notifications
  const sessions = await Session.find({
    _id: { $in: acceptedSessionIds },
    counselor: counselorId,
    status: { $in: ['Pending', 'Active'] }
  }).populate('user', 'username');

  res.status(200).json({
    success: true,
    sessions,
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

     // Calculate 1 day ago
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Get notifications only from the past 1 day
    let notifications = await Notification.find({
      counselor: counselorId,
      createdAt: { $gte: oneDayAgo }  // ✅ only within last 24 hours
    }).sort({ createdAt: -1 });

    // Get all sitting_recommendation related userIds
    const sittingUserIds = notifications
      .filter(n => n.type === "sitting_recommendation" && n.userId)
      .map(n => n.userId);

    const acceptedSittings = await Notification.find({
      userId: { $in: sittingUserIds },
      type: "sitting_recommendation",
      accepted: true,
      counselor: { $ne: counselorId }
    }).select("userId");

    const acceptedUserIds = new Set(acceptedSittings.map(s => s.userId.toString()));

    const filteredNotifications = notifications.filter(n => {
      if (n.type === "sitting_recommendation" && n.userId) {
        return !acceptedUserIds.has(n.userId.toString());
      }
      return true;
    });

    res.status(200).json(filteredNotifications);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
};

// Update Feedback (Counselor Feedback)
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
    console.log("Update profile request body:", req.body);
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
  const { 
    sessionId, 
    userId, 
    diagnosis, 
    symptoms, 
    needsSittings, 
    recommendedSittings, 
    willingToTreat, 
    notes, 
    sittingNotes, 
    curedSittingReason,
    progressPercentage,
    adjustSittings,
    adjustedSittingsCount
  } = req.body;
  
  if (!sessionId || !userId || !diagnosis) {
    return res.status(400).json({ message: "Session ID, user ID, and diagnosis are required." });
  }

  const session = await Session.findById(sessionId);
  if (!session) return res.status(404).json({ message: "Session not found." });

  session.counsellorReview = {
    diagnosis,
    symptoms,
    needsSittings,
    recommendedSittings,
    willingToTreat,
    notes,
    sittingNotes,
    curedSittingReason,
    progressPercentage,
    adjustSittings,
    adjustedSittingsCount,
    reviewedAt: new Date()
  };
  await session.save();

  // Update User record 
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
      progressPercentage,
      adjustSittings,
      adjustedSittingsCount,
      reviewedAt: new Date()
    });

    if (needsSittings && recommendedSittings > 0) {
      if (curedSittingReason) {
        user.sittingNotes = [];
        user.inSittingSeries = false;
      } else {
        if (sittingNotes && sittingNotes.trim()) {
          if (!Array.isArray(user.sittingNotes)) user.sittingNotes = [];
          user.sittingNotes.push(sittingNotes.trim());
        }
        user.inSittingSeries = true;
        if (adjustSittings && adjustSittings !== 'maintain' && adjustedSittingsCount) {
          user.totalRecommendedSittings = adjustedSittingsCount;
        }
      }
    } else {
      user.sittingNotes = [];
      user.inSittingSeries = false;
    }

    await user.save();
  }

  // counsellor-client logic
  if (needsSittings && recommendedSittings > 0 && willingToTreat) {
    const counsellor = await Counsellor.findById(session.counselor);
    if (counsellor) {
      const existingClientIndex = counsellor.clients.findIndex(
        client => client.userId.toString() === userId.toString()
      );

      if (existingClientIndex !== -1) {
        counsellor.clients[existingClientIndex].sessionCount += 1;
        counsellor.clients[existingClientIndex].recommendedSessions = recommendedSittings;
        counsellor.clients[existingClientIndex].status = curedSittingReason ? 'completed' : 'active';
      } else {
        counsellor.clients.push({
          userId: userId,
          addedAt: new Date(),
          status: curedSittingReason ? 'completed' : 'active',
          sessionCount: 1,
          recommendedSessions: recommendedSittings
        });
      }

      await counsellor.save();
    }
  }

  // CREATE NOTIFICATIONS FOR OTHER COUNSELLORS
  if (needsSittings && recommendedSittings > 0 && !willingToTreat) {
    const allCounsellors = await Counsellor.find({ _id: { $ne: session.counselor } }).select("_id");

    const notifications = allCounsellors.map(c => ({
      counselor: c._id,
      title: "New Sitting Recommendation",
      message: `User ${user.username} has been recommended ${recommendedSittings} sittings. Will you take it up?`,
      type: "sitting_recommendation",
      userId,
      meta: { diagnosis, recommendedSittings },
      unread: true
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
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
    const counselorId = req.counsellor._id; // from JWT middleware
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

// Get all clients for a counsellor
export const getClients = async (req, res) => {
    try {
        const counsellorId = req.counsellor._id;

        const counsellor = await Counsellor.findById(counsellorId)
            .populate('clients.userId', 'fullName email mobileNumber')
            .select('clients');

        if (!counsellor) {
            return res.status(404).json({ message: 'Counsellor not found' });
        }

        // Format the clients data for frontend
        const clientsData = counsellor.clients.map(client => {
            const userInfo = client.userId;
            return {
                id: client.userId._id,
                name: userInfo.fullName,
                clientName: userInfo.fullName,
                email: userInfo.email,
                phone: userInfo.mobileNumber,
                sessions: client.sessionCount,
                sessionCount: client.sessionCount,
                lastSession: client.lastSession,
                status: client.status,
                notes: client.notes || 'No notes available',
                addedAt: client.addedAt,
                recommendedSessions: client.recommendedSessions
            };
        });

        res.status(200).json(clientsData);
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get available time slots for a week
export const getAvailableSlots = async (req, res) => {
    try {
        const counsellorId = req.counsellor._id;
        const { clientId } = req.params;

        // Get counsellor availability
        const counsellor = await Counsellor.findById(counsellorId).select('availability');
        if (!counsellor) {
            return res.status(404).json({ message: 'Counsellor not found' });
        }

        // Get current date and next 7 days
        const today = moment().startOf('day');
        const weekDates = [];
        
        for (let i = 0; i < 7; i++) {
            const date = moment(today).add(i, 'days');
            weekDates.push({
                date: date.format('YYYY-MM-DD'),
                dayName: date.format('dddd'),
                fullDate: date.toDate()
            });
        }

        // Get existing appointments for the week
        const startOfWeek = today.toDate();
        const endOfWeek = moment(today).add(6, 'days').endOf('day').toDate();
        
        const existingAppointments = await Appointment.find({
            counsellorId: counsellorId,
            appointmentDate: {
                $gte: startOfWeek,
                $lte: endOfWeek
            },
            status: { $ne: 'cancelled' }
        }).select('appointmentDate startTime endTime');

        // Create available slots
        const availableSlots = [];

        weekDates.forEach(dateInfo => {
            const dayAvailability = counsellor.availability.find(
                avail => avail.day === dateInfo.dayName
            );

            if (dayAvailability && dayAvailability.slots.length > 0) {
                const daySlots = [];

                dayAvailability.slots.forEach(slot => {
                    // Check if this slot is already booked
                    const isBooked = existingAppointments.some(appointment => {
                        const appointmentDate = moment(appointment.appointmentDate).format('YYYY-MM-DD');
                        return appointmentDate === dateInfo.date && 
                               appointment.startTime === slot.startTime;
                    });

                    // Only include future slots (not past slots for today)
                    const slotDateTime = moment(`${dateInfo.date} ${slot.startTime}`, 'YYYY-MM-DD HH:mm');
                    const now = moment();

                    if (!isBooked && slotDateTime.isAfter(now)) {
                        daySlots.push({
                            startTime: slot.startTime,
                            endTime: slot.endTime,
                            available: true
                        });
                    }
                });

                if (daySlots.length > 0) {
                    availableSlots.push({
                        date: dateInfo.date,
                        dayName: dateInfo.dayName,
                        slots: daySlots
                    });
                }
            }
        });

        res.status(200).json(availableSlots);
    } catch (error) {
        console.error('Error fetching available slots:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Schedule an appointment
export const scheduleAppointment = async (req, res) => {
    try {
        const counsellorId = req.counsellor._id;
        const { clientId, appointmentDate, startTime, endTime, notes, sessionType } = req.body;

        if (!clientId || !appointmentDate || !startTime || !endTime) {
            return res.status(400).json({ 
                message: 'Client ID, appointment date, start time, and end time are required' 
            });
        }

        const counsellor = await Counsellor.findById(counsellorId);
        const clientExists = counsellor.clients.some(
            client => client.userId.toString() === clientId
        );

        if (!clientExists) {
            return res.status(400).json({ message: 'Client not found or not assigned to this counsellor' });
        }

        const appointmentDateTime = moment(`${appointmentDate} ${startTime}`, 'YYYY-MM-DD HH:mm');
        if (!appointmentDateTime.isAfter(moment())) {
            return res.status(400).json({ message: 'Appointment must be scheduled for a future time' });
        }

        const existingAppointment = await Appointment.findOne({
            counsellorId,
            appointmentDate: new Date(appointmentDate),
            startTime,
            status: { $ne: 'cancelled' }
        });

        if (existingAppointment) {
            return res.status(400).json({ message: 'This time slot is already booked' });
        }

        // Create a session for the appointment
        const roomName = `appointment-${counsellorId}-${clientId}-${Date.now()}`;
        const newSession = await Session.create({
            user: clientId,
            counselor: counsellorId,
            roomName,
            issueDetails: notes || `Scheduled ${sessionType || 'follow-up'} session`,
            status: "Pending"
        });

        const newAppointment = new Appointment({
            counsellorId,
            clientId,
            appointmentDate: new Date(appointmentDate),
            startTime,
            endTime,
            notes: notes || '',
            sessionType: sessionType || 'follow-up',
            sessionId: newSession._id
        });

        await newAppointment.save();

        const populatedAppointment = await Appointment.findById(newAppointment._id)
            .populate('clientId', 'fullName email mobileNumber parent_phone_no')
            .populate('sessionId');

        // Get counsellor info for email
        const counsellorInfo = await Counsellor.findById(counsellorId).select('fullName specialization email mobileNumber');

        // ✅ Send Email Notification to User
        try {
            if (populatedAppointment.clientId?.email) {
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS,
                    },
                });

                const appointmentDateFormatted = moment(appointmentDate).format('dddd, MMMM Do YYYY');
                
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: populatedAppointment.clientId.email,
                    subject: 'Appointment Confirmation - MindFull',
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
                            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                <h2 style="color: #2563eb; margin-bottom: 20px;">Appointment Confirmed</h2>
                                <p style="font-size: 16px; color: #333;">Hello ${populatedAppointment.clientId.fullName},</p>
                                <p style="font-size: 16px; color: #333;">Your appointment has been successfully scheduled.</p>
                                
                                <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                    <h3 style="color: #1e40af; margin-top: 0;">Appointment Details:</h3>
                                    <p style="margin: 10px 0;"><strong>Counsellor:</strong> ${counsellorInfo.fullName}</p>
                                    <p style="margin: 10px 0;"><strong>Specialization:</strong> ${counsellorInfo.specialization || 'Mental Health Professional'}</p>
                                    <p style="margin: 10px 0;"><strong>Date:</strong> ${appointmentDateFormatted}</p>
                                    <p style="margin: 10px 0;"><strong>Time:</strong> ${startTime} - ${endTime}</p>
                                    <p style="margin: 10px 0;"><strong>Session Type:</strong> ${sessionType || 'Follow-up'}</p>
                                    ${notes ? `<p style="margin: 10px 0;"><strong>Notes:</strong> ${notes}</p>` : ''}
                                </div>
                                
                                <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                    <h4 style="color: #374151; margin-top: 0; margin-bottom: 10px;">Counsellor Contact Information:</h4>
                                    ${counsellorInfo.email ? `<p style="margin: 5px 0; color: #4b5563;"><strong>Email:</strong> ${counsellorInfo.email}</p>` : ''}
                                    ${counsellorInfo.mobileNumber ? `<p style="margin: 5px 0; color: #4b5563;"><strong>Phone:</strong> ${counsellorInfo.mobileNumber}</p>` : ''}
                                </div>
                                
                                <p style="font-size: 14px; color: #666; margin-top: 20px;">Please log in to your account 5 minutes before your appointment time to join the session.</p>
                                <p style="font-size: 14px; color: #666;">If you need to reschedule or cancel, please contact your counsellor as soon as possible.</p>
                                
                                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                                    <p style="font-size: 12px; color: #999; margin: 0;">This is an automated message from MindFull. Please do not reply to this email.</p>
                                </div>
                            </div>
                        </div>
                    `
                });
                console.log('✅ Email notification sent to user:', populatedAppointment.clientId.email);
            }
        } catch (err) {
            console.error('❌ Error sending email notification:', err.message);
        }

        // ✅ Twilio SMS Notification to User
        try {
            if (populatedAppointment.clientId?.mobileNumber) {
                const contactInfo = counsellorInfo.mobileNumber ? ` Contact: ${counsellorInfo.mobileNumber}` : '';
                await client.messages.create({
                    body: `Hello ${populatedAppointment.clientId.fullName}, your appointment has been scheduled for ${appointmentDate} at ${startTime} with ${counsellorInfo.fullName}.${contactInfo} Please check your email for details.`,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: populatedAppointment.clientId.mobileNumber
                });
                console.log('✅ SMS notification sent to user');
            }
        } catch (err) {
            console.error('❌ Error sending SMS to user:', err.message);
        }

        // ✅ SMS Notification to Parent (if parent phone number exists)
        try {
            if (populatedAppointment.clientId?.parent_phone_no) {
                const parentPhone = populatedAppointment.clientId.parent_phone_no.toString();
                // Ensure phone number has country code
                const formattedParentPhone = parentPhone.startsWith('+') ? parentPhone : `+91${parentPhone}`;
                const contactInfo = counsellorInfo.mobileNumber ? ` Counsellor contact: ${counsellorInfo.mobileNumber}` : '';
                
                await client.messages.create({
                    body: `Your child ${populatedAppointment.clientId.fullName} has a counselling appointment scheduled on ${moment(appointmentDate).format('MMM Do')} at ${startTime} with ${counsellorInfo.fullName}.${contactInfo} - MindFull`,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: formattedParentPhone
                });
                console.log('✅ SMS notification sent to parent:', formattedParentPhone);
            }
        } catch (err) {
            console.error('❌ Error sending SMS to parent:', err.message);
        }

        res.status(201).json({
            message: 'Appointment scheduled successfully',
            appointment: populatedAppointment
        });
    } catch (error) {
        console.error('Error scheduling appointment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get today's appointments for a counsellor
export const getTodaysAppointments = async (req, res) => {
  try {
    const counsellorId = req.counsellor._id;
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const appointments = await Appointment.find({
      counsellorId,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
    }).populate("clientId", "fullName");

    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching today’s appointments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get appointments for a counsellor
export const getAppointments = async (req, res) => {
    try {
        const counsellorId = req.counsellor._id;
        const { date, status } = req.query;
        console.log('Query params:', req.query);
        let query = { counsellorId };
        
        // Filter by date if provided
       if (date) {
    query = {
        ...query,
        $expr: {
            $eq: [
                { $dateToString: { format: "%Y-%m-%d", date: "$appointmentDate" } },
                date
            ]
        }
    };
}

        // Filter by status if provided
        if (status && status !== 'all') {
            query.status = status;
        }

        const appointments = await Appointment.find(query)
            .populate('clientId', 'fullName email mobileNumber')
            .populate('sessionId')
            .sort({ appointmentDate: 1, startTime: 1 });

        res.status(200).json(appointments);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update appointment status
export const updateAppointmentStatus = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { status, notes } = req.body;
        const counsellorId = req.counsellor._id;

        // Check if this is the counselor-joined route
        if (req.path.includes('counselor-joined')) {
            const appointment = await Appointment.findOne({
                _id: appointmentId,
                counsellorId
            });

            if (!appointment) {
                return res.status(404).json({ message: 'Appointment not found' });
            }

            appointment.counselorJoined = true;
            appointment.updatedAt = new Date();
            await appointment.save();

            return res.status(200).json({ 
                message: 'Counselor joined status updated',
                appointment
            });
        }

        const appointment = await Appointment.findOne({
            _id: appointmentId,
            counsellorId
        }).populate('clientId', 'fullName mobileNumber');

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        appointment.status = status || appointment.status;
        appointment.notes = notes || appointment.notes;
        appointment.updatedAt = new Date();

        await appointment.save();

        if (status === 'completed') {
            await Counsellor.updateOne(
                { _id: counsellorId, 'clients.userId': appointment.clientId },
                { 
                    $inc: { 'clients.$.sessionCount': 1 },
                    $set: { 'clients.$.lastSession': new Date() }
                }
            );
        }

        // ✅ Twilio SMS Notification
        try {
            if (appointment.clientId?.mobileNumber) {
                let messageBody = '';
                if (status === 'completed') {
                    messageBody = `Hi ${appointment.clientId.fullName}, your counselling session has been marked as completed. Thank you!`;
                } else if (status === 'cancelled') {
                    messageBody = `Hi ${appointment.clientId.fullName}, your appointment scheduled on ${appointment.appointmentDate.toDateString()} has been cancelled.`;
                } else {
                    messageBody = `Your appointment status has been updated to: ${status}.`;
                }

                await client.messages.create({
                    body: messageBody,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: appointment.clientId.mobileNumber
                });
                console.log('Twilio: appointment status update SMS sent');
            }
        } catch (err) {
            console.error('Twilio error:', err.message);
        }

        res.status(200).json({
            message: 'Appointment updated successfully',
            appointment
        });
    } catch (error) {
        console.error('Error updating appointment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


        // Update appointment details (date/time/type/notes/client)
        export const updateAppointment = async (req, res) => {
          try {
            console.log('Update appointment request body:', req.body);
            const counsellorId = req.counsellor._id;
            const { appointmentId } = req.params;
            const {
              clientId,
              appointmentDate,
              startTime,
              endTime,
              sessionType,
              notes,
              status,
            } = req.body;

            const appointment = await Appointment.findById(appointmentId);
            if (!appointment) {
              return res.status(404).json({ success: false, message: 'Appointment not found' });
            }
            if (appointment.counsellorId.toString() !== counsellorId.toString()) {
              return res.status(403).json({ success: false, message: 'Not authorized to update this appointment' });
            }

            // Create session if it doesn't exist
            if (!appointment.sessionId) {
              const roomName = `appointment-${counsellorId}-${appointment.clientId}-${Date.now()}`;
              const newSession = await Session.create({
                user: appointment.clientId,
                counselor: counsellorId,
                roomName,
                issueDetails: appointment.notes || `Scheduled ${appointment.sessionType || 'follow-up'} session`,
                status: "Pending"
              });
              appointment.sessionId = newSession._id;
              await appointment.save();
            }

            const updates = {};
            if (typeof clientId === 'string' && clientId.trim()) updates.clientId = clientId;
            if (appointmentDate) {
              const dateObj = new Date(appointmentDate);
              if (isNaN(dateObj)) {
                return res.status(400).json({ success: false, message: 'Invalid appointmentDate' });
              }
              updates.appointmentDate = dateObj;
            }

            const timeRegex = /^([01]?\d|2[0-3]):[0-5]\d$/; // HH:MM
            if (typeof startTime === 'string') {
              if (!timeRegex.test(startTime)) {
                return res.status(400).json({ success: false, message: 'Invalid startTime format. Use HH:MM' });
              }
              updates.startTime = startTime;
            }
            if (typeof endTime === 'string') {
              if (!timeRegex.test(endTime)) {
                return res.status(400).json({ success: false, message: 'Invalid endTime format. Use HH:MM' });
              }
              updates.endTime = endTime;
            }
            if (typeof sessionType === 'string') updates.sessionType = sessionType;
            if (typeof notes === 'string') updates.notes = notes;
            if (typeof status === 'string') updates.status = status;

            updates.updatedAt = new Date();

            const updated = await Appointment.findByIdAndUpdate(appointmentId, { $set: updates }, { new: true })
              .populate('clientId', 'fullName email mobileNumber')
              .populate('sessionId');

            return res.status(200).json({ success: true, appointment: updated });
          } catch (error) {
            console.error('Error updating appointment:', error);
            return res.status(500).json({ success: false, message: 'Failed to update appointment' });
          }
        };

// Delete appointment
export const deleteAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const counsellorId = req.counsellor._id;

    // Find appointment
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      counsellorId,
    }).populate("clientId", "fullName email mobileNumber parentMobileNumber");

    if (!appointment) {
      return res
        .status(404)
        .json({ message: "Appointment not found or unauthorized" });
    }

    // Delete from DB
    await Appointment.findByIdAndDelete(appointmentId);

    // --- Twilio SMS Notification ---
    try {
      const twilioClient = twilio(
        process.env.TWILIO_SID,
        process.env.TWILIO_AUTH_TOKEN
      );

      const messageBody = `Dear ${appointment.clientId.fullName}, your appointment scheduled on ${appointment.appointmentDate.toDateString()} at ${appointment.startTime} has been cancelled.`;

      // Send SMS to student
      if (appointment.clientId.mobileNumber) {
        await twilioClient.messages.create({
          body: messageBody,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: appointment.clientId.mobileNumber,
        });
      }

      // Send SMS to parent if available
      if (appointment.clientId.parentMobileNumber) {
        await twilioClient.messages.create({
          body: messageBody,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: appointment.clientId.parentMobileNumber,
        });
      }
    } catch (twilioError) {
      console.error("Twilio SMS error:", twilioError.message);
    }

    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};