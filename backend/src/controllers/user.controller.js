import { createAndPushNotification } from "../services/eventupdate.js";
import {Event} from '../models/event.model.js';
import Notification from '../models/notification.model.js';
import asyncHandler from "../utils/asynchandler.utils.js";
import {ApiError} from "../utils/API_Error.js";
import { User } from "../models/user.model.js";
import { Resource } from "../models/resource.model.js";
import { Journal } from "../models/journal.model.js";
import { Mood } from "../models/mood.model.js";
import { Interest } from "../models/interests.models.js";
import { Issue } from "../models/Issues.model.js";
import { Counsellor } from "../models/counsellor.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import ApiResponse from "../utils/API_Response.js";
import jwt from "jsonwebtoken";
import { Session } from "../models/session.model.js";
import { Appointment } from "../models/appointment.model.js";
import Tesseract from 'tesseract.js';
import axios from "axios";
import { getDistrictAndState } from "../utils/getDistrict.js";

const additionalActivities = [
  // Stress Relief
  {
    title: "Stretching Routines",
    type: "Physical Wellness",
    content: "Simple stretches to release tension and improve flexibility. Example: Take a 5-minute break to stretch your neck and back.",
  },
  {
    title: "Dance Therapy",
    type: "Physical Wellness",
    content: "Uplift your mood by dancing to your favorite tunes. Example: Groove to a 10-minute dance workout playlist.",
  },
  {
    title: "Home Workouts",
    type: "Physical Wellness",
    content: "Short workout sessions to energize your body and mind.",
  },
  {
    title: "Breathing Exercises",
    type: "Stress Relief",
    content: "Practice controlled breathing to reduce stress. Example: Try the 4-7-8 breathing technique for instant relaxation.",
  },
  {
    title: "Gratitude Practice",
    type: "Stress Relief",
    content: "Focus on positivity by listing what you're thankful for. Example: Start a gratitude jar and add a note daily.",
  },
  {
    title: "Visualization Techniques",
    type: "Stress Relief",
    content: "Imagine calming scenes to alleviate anxiety. Example: Picture yourself on a serene beach for 5 minutes.",
  },

  // Social Connection
  {
    title: "Virtual Support Groups",
    type: "Social Connection",
    content: "Connect with others in a safe, moderated environment. Example: Join a community of like-minded individuals.",
  },
  {
    title: "Random Acts of Kindness",
    type: "Social Connection",
    content: "Perform small gestures to spread positivity. Example: Send a thoughtful message to a friend today.",
  },
  {
    title: "Story Sharing",
    type: "Social Connection",
    content: "Share personal experiences to inspire and connect. Example: Write about a challenge you overcame and share it anonymously.",
  },

  // Creative Outlets
  {
    title: "Art Therapy",
    type: "Creative Outlets",
    content: "Draw, paint, or doodle to express emotions. Example: Sketch your emotions for 10 minutes.",
  },
  {
    title: "Music Sessions",
    type: "Creative Outlets",
    content: "Listen to calming or uplifting playlists. Example: Discover soothing nature sounds or meditation music.",
  },
  {
    title: "DIY Crafts",
    type: "Creative Outlets",
    content: "Engage in hands-on activities like origami or knitting. Example: Make a simple DIY stress ball using balloons and rice.",
  },

  // Lifestyle & Personal Growth
  {
    title: "Time Management Tips",
    type: "Lifestyle & Personal Growth",
    content: "Learn to prioritize tasks effectively. Example: Plan your day using the Pomodoro Technique.",
  },
  {
    title: "Healthy Eating Suggestions",
    type: "Lifestyle & Personal Growth",
    content: "Discover nutritious recipes and snack ideas. Example: Try a recipe for a refreshing fruit smoothie.",
  },
  {
    title: "Digital Detox Challenges",
    type: "Lifestyle & Personal Growth",
    content: "Limit screen time to recharge mentally. Example: Spend an hour device-free before bed tonight.",
  },
  {
    title: "Sleep Hygiene Tips",
    type: "Lifestyle & Personal Growth",
    content: "Improve sleep quality with better bedtime routines. Example: Try a calming herbal tea and reduce blue light exposure.",
  },

  // Mindful Activities
  {
    title: "Walking Meditation",
    type: "Mindful Activities",
    content: "Combine mindfulness with light exercise. Example: Focus on your steps and breathing during your walk.",
  },
  {
    title: "Nature Appreciation",
    type: "Mindful Activities",
    content: "Spend time observing nature to rejuvenate. Example: Take 10 minutes to sit outside and enjoy the fresh air.",
  },
  {
    title: "Mindful Eating",
    type: "Mindful Activities",
    content: "Pay attention to your food’s taste, texture, and smell. Example: Savor your next meal by eating slowly and mindfully.",
  },
];

const getRandomActivity = () => {
  const randomIndex = Math.floor(Math.random() * additionalActivities.length);
  return additionalActivities[randomIndex];
};

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    console.log("User found:", user); // Log user to verify it's fetched correctly

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    console.log("Access token:", accessToken); // Log tokens for debugging
    console.log("Refresh token:", refreshToken);

    user.refreshToken = refreshToken; // Store the refresh token in the user document
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error generating tokens:", error); // Log the error for debugging
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

/**
 * Reverse-geocodes latitude & longitude into district and state.
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<{district: string | null, state: string | null}>}
 */
export const getDistrictFromCoords = async (lat, lng) => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
    
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "YourAppName/1.0 (your-email@example.com)", // required by Nominatim TOS
      },
    });

    if (!response.data || !response.data.address) {
      console.warn("No address found for given coordinates.");
      return { district: null, state: null };
    }

    const address = response.data.address;
    const district =
      address.county || address.city_district || address.suburb || null;
    const state = address.state || null;

    return { district, state };
  } catch (error) {
    console.error("Error fetching district/state from coords:", error.message);
    return { district: null, state: null };
  }
};

const registerUser = asyncHandler(async (req, res) => {
  try {
      const { fullName, email, username, password, gender, age, location } = req.body;
      const idCardFile = req.file?.path;
  
      if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
          return res.status(400).json({ success: false, message: "All fields are required" });
      }
  
      // Check if user exists
      const existedUser = await User.findOne({ $or: [{ username }, { email }] });
      if (existedUser) {
          return res.status(409).json({ success: false, message: "User with email or username already exists" });
      }

      if (age < 18 && !idCardFile) {
          return res.status(400).json({ success: false, message: "ID card upload mandatory for students" });
      }
  
      // Process location
      let parsedLocation;
      try {
      parsedLocation = JSON.parse(location);
    } catch {
      return res.status(400).json({ success: false, message: "Invalid location JSON format" });
    }
    if (
      parsedLocation.type !== "Point" ||
      !Array.isArray(parsedLocation.coordinates) ||
      parsedLocation.coordinates.length !== 2
    ) {
      return res.status(400).json({ success: false, message: "Invalid location format" });
    }

    // 5) Reverse‐geocode district/state
    const [lng, lat] = parsedLocation.coordinates;
    let district = null;
    let state = null;
    try {
      ({ district, state } = await getDistrictFromCoords(lat, lng) || {});
      console.log(`Geocoded location: District - ${district}, State - ${state}`);
    } catch (geocodeError) {
      console.error("Geocoding failed:", geocodeError);
    }

      // Create user
      const user = await User.create({
          fullName,
          email,
          password,
          gender,
          age,
          username: username.toLowerCase(),
          idCard: idCardFile,
          location: parsedLocation,
          district,
          state,
      });

      console.log("User successfully created:", user);
      await user.assignRandomAvatar(); 
      await user.save();

      // Generate tokens
      const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
      console.log("Generated Tokens:", { accessToken, refreshToken });

      // Cookie options
      const options = {
          httpOnly: true,
          secure: false,
          sameSite: "lax",
      };

      // Send response
      return res
          .status(201)
          .cookie("accessToken", accessToken, options)
          .cookie("refreshToken", refreshToken, options)
          .json({
              success: true,
              message: "User registered successfully",
              data: {
                  user: await User.findById(user._id).select("-password"),
                  accessToken,
              },
          });

  } catch (error) {
      console.error("Error during registration:", error);
      return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
});

const getUserSessions = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming you have authentication middleware
        // Find all sessions where this user is the client
    const sessions = await Session.find({ user: userId })
      .populate('counselor', 'fullName specialization email') // Populate counselor details
      .sort({ createdAt: -1 }) // Sort by most recent first
      .lean(); // Convert to plain JS object for better performance
    
    // Format the sessions for frontend consumption
    const formattedSessions = sessions.map(session => ({
      _id: session._id,
      status: session.status,
      issueDetails: session.issueDetails,
      createdAt: session.createdAt,
      endedAt: session.endedAt,
      notes: session.notes,
      userNotes: session.userNotes,
      feedback: session.feedback,
      rating: session.rating,
      counselor: session.counselor ? {
        _id: session.counselor._id,
        fullName: session.counselor.fullName,
        specialization: session.counselor.specialization,
        email: session.counselor.email
      } : null,
    }));
    
    return res.status(200).json(formattedSessions);
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    return res.status(500).json({ message: 'Failed to fetch sessions', error: error.message });
  }
};

// feedback
export const updateFeedback = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { feedback, sessionId, rating } = req.body;
  // Validate inputs
  if (!userId || !sessionId) {
      throw new ApiError(400, "User ID, session ID are required");
  }

  // Find the user
  const user = await User.findById(userId);
  if (!user) {
      throw new ApiError(404, "User not found");
  }
  // Find the session and update feedback and rating
  const session = await Session.findById(sessionId).populate('counselor');
  
  if (!session) {
      throw new ApiError(404, "Session not found");
  }

  // Update session with feedback and rating
  session.feedback = feedback;
  if (rating) {
      session.rating = rating;
  }
  await session.save();

  // Also add feedback to counselor if needed
  if (session.counselor && session.counselor.feedback) {
      session.counselor.feedback.push({ userId, feedback });
      await session.counselor.save();
  }

  return res
      .status(200)
      .json(new ApiResponse(200, { feedback: session.feedback, rating: session.rating }, "Feedback updated successfully"));
});

  
const addInterests = asyncHandler(async (req, res) => {
  const { selected_interests, goal } = req.body;
  const userId = req.user._id;
  console.log(req.body)
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const user_interests = [];

  // Save interests
  for (const tagName of selected_interests) {
    const tag = await Interest.create({
      name: tagName,
      user: userId,
      isGoal: false, // Regular interests are not goals
    });

    user_interests.push(tag._id);
  }

  // Save goal if provided
  if (goal) {
    const goalTag = await Interest.create({
      name: goal,
      user: userId,
      isGoal: true, // Mark this as a goal
    });

    user_interests.push(goalTag._id);
  }

  // Update user's interests
  user.interests = user_interests;
  await user.save();

  return res.status(200).json({
    status: "success",
    message: "User interests and goal added successfully",
  });
});

  export const addIssues = asyncHandler(async (req, res) => {
    const { diagnosed_issues } = req.body;  // Expecting an array of { issueName, severity }
    const userId = req.user._id;
    console.log("Full request body:", req.body);
    console.log("Full user object:", req.user);
    if (!Array.isArray(diagnosed_issues) || diagnosed_issues.length === 0) {
      return res.status(400).json({ message: "Diagnosed issues must be an array with at least one issue." });
    }
  
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
  
    const validIssues = [
      "Anxiety",
      "Depression",
      "Bipolar",
      "Ocd",
      "PTSD",
      "Substance Use",
      "ADHD",
      "Eating Disorders",
    ];
    const user_issues = [];
  
    for (const { illnessType, severity } of diagnosed_issues) {
      if (typeof illnessType !== "string" || !validIssues.includes(illnessType)) {
        return res.status(400).json({ message: `${illnessType} is not a valid issue` });
      }
  
      if (!["Low", "Moderate", "High"].includes(severity)) {
        return res.status(400).json({ message: `Invalid severity level for ${illnessType}` });
      }
  
      try {
        const issue = await Issue.create({ illnessType, severity, user: userId });
        user_issues.push(issue._id);
      } catch (error) {
        console.log("Error creating issue:", error);
        return res.status(400).json({ message: error.message });
      }
      //user_issues.push(issue._id);
    }
  
    user.issues = user_issues;
    await user.save();
  
    return res.status(200).json({
      status: "success",
      message: "User issues added successfully",
    });
  });
  
  
  const loginUser = asyncHandler(async (req, res) => {
    const { username, password, mood } = req.body;
    if (!username) {
      throw new ApiError(400, "Username is required");
    }
  
    const user = await User.findOne({ username });
    if (!user) {
      throw new ApiError(404, "User does not exist");
    }
  
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid user credentials");
    }
  
    // Streak logic
    const now = new Date();
const lastLogin = user.lastLoginDate;

if (!lastLogin) {
  user.streak = 1; // First login
} else {
  // Convert to UTC midnight timestamps to ensure full-day difference calculation
  const lastLoginDay = new Date(lastLogin).setHours(0, 0, 0, 0);
  const today = new Date(now).setHours(0, 0, 0, 0);

  const diffInDays = (today - lastLoginDay) / (1000 * 60 * 60 * 24);

  if (diffInDays === 1) {
    user.streak += 1; // Continue streak
  } else if (diffInDays > 1) {
    user.streak = 1; // Reset streak
  }
}

// Update max streak if needed
user.maxStreak = Math.max(user.maxStreak || 0, user.streak);

// Update last login date
user.lastLoginDate = now;
await user.save();
  
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
  
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
  
    const options = {
      httpOnly: true,
      secure: true,
    };
    const events = await Event.find({ user: user._id }); // Fetch all events related to the user

    const today = new Date();
    const eventNotifications = [];

    // Check each event to see if it's 7 or 3 days away
    for (const eventRec of events) {
      const eventDate = new Date(eventRec.date);
      const daysToEvent = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24)); // Calculate days until event

      // If the event is 7 or 3 days away, send a notification
      if (daysToEvent === 7 || daysToEvent === 3) {
        const notificationData = {
          message: `Event Reminder: ${eventRec.entryText} is ${daysToEvent} days away!`,
          user: user._id,
          relatedInterest: user.interests, // Assuming interests are directly associated with the user
          event: eventRec._id,
        };
        const notification = new Notification(notificationData);
        await notification.save();

        // Push the notification using the existing function
        await createAndPushNotification(notificationData, req.io);
        eventNotifications.push(notificationData); // Track notifications sent
      }
    }
  
    const randomActivity = getRandomActivity();
    await saveUserMood(user._id, mood);
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(200, {
          user: loggedInUser,
          accessToken,
          refreshToken,
          streak: user.streak,
          maxStreak: user.maxStreak,
          suggestedActivity: randomActivity,
        }, "User logged in successfully"),
      );
  });
  export const getActiveSessions = asyncHandler(async (req, res) => {
    const userId  = req.user._id;

    const sessions = await Session.find({
        user: userId
    }).populate('counselor', 'fullName');

    res.status(200).json({
        success: true,
        sessions
    });
});
  const saveUserMood = async (userId, mood) => {
    try {
      // Validate mood input
      if (!mood) {
        throw new Error("Mood is required.");
      }
  
      // Create a new mood record
      const newMood = new Mood({
        user: userId,
        mood,
      });
  
      // Save the mood record to the database
      await newMood.save();
  
      // Return success message or saved mood data
      return { message: "Mood saved successfully.", mood: newMood };
    } catch (error) {
      // Handle any errors
      throw new Error(`Error saving mood: ${error.message}`);
    }
  };

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    },
  );

  const options = {
    httpOnly: true,
    //secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed",
        ),
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res
      .status(401)
      .json(new ApiResponse(401, null, "User not authenticated"));
  }

  // Populate interests (fetching their name & goal) and journals (fetching their topic)
  const user = await User.findById(req.user._id)
    .populate({
      path: "interests",
      select: "name isGoal",
    })
    .populate({
      path: "journals",
      select: "topic",
    })
    .select("-password"); // Exclude password for security

  if (!user) {
    return res.status(404).json(new ApiResponse(404, null, "User not found"));
  }

  // Format the response to include `goal` instead of `isGoal`
  const formattedUser = {
    ...user.toObject(),
    interests: user.interests.map((interest) => ({
      name: interest.name,
      goal: interest.isGoal, // Renaming isGoal to goal
    })),
    journals: user.journals.map((journal) => ({
      topic: journal.topic,
    })),
  };

  return res
    .status(200)
    .json(new ApiResponse(200, formattedUser, "User fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email, interests, age, gender, username, phone_no } = req.body;

  // Build update object with only provided fields
  const updateFields = {};
  if (fullName !== undefined) updateFields.fullName = fullName;
  if (email !== undefined) updateFields.email = email;
  if (username !== undefined) updateFields.username = username;
  if (gender !== undefined) updateFields.gender = gender;
  if (age !== undefined) updateFields.age = age;
  if (phone_no !== undefined) updateFields.phone_no = phone_no;
  
  // Handle interests - they need to be created/updated as Interest documents
  if (interests !== undefined && Array.isArray(interests)) {
    const userId = req.user._id;
    const interestIds = [];
    
    for (const interest of interests) {
      // Check if interest is an object with name property or just a string/ObjectId
      if (typeof interest === 'object' && interest.name) {
        // Find or create the interest
        let interestDoc = await Interest.findOne({ 
          name: interest.name, 
          user: userId 
        });
        
        if (!interestDoc) {
          // Create new interest
          interestDoc = await Interest.create({
            name: interest.name,
            user: userId,
            isGoal: interest.goal || false
          });
        } else {
          // Update existing interest's goal status if needed
          if (interest.goal !== undefined && interestDoc.isGoal !== interest.goal) {
            interestDoc.isGoal = interest.goal;
            await interestDoc.save();
          }
        }
        
        interestIds.push(interestDoc._id);
      } else if (typeof interest === 'string') {
        // If it's already an ObjectId string, use it directly
        try {
          interestIds.push(interest);
        } catch (error) {
          console.log('Invalid interest ID:', interest);
        }
      }
    }
    
    updateFields.interests = interestIds;
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: updateFields },
    { new: true }
  )
    .populate({
      path: "interests",
      select: "name isGoal",
    })
    .select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Format interests for response
  const formattedUser = {
    ...user.toObject(),
    interests: user.interests.map((interest) => ({
      name: interest.name,
      goal: interest.isGoal,
    })),
  };

  return res
    .status(200)
    .json(new ApiResponse(200, formattedUser, "Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { avatar: user.avatar }, "Avatar updated successfully"));
});

const userProgress = asyncHandler(async (req,res) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Calculate the journal entry count
    const journalCount = await Journal.countDocuments({ user: userId });

    const progress = {
      name: user.name,
      email: user.email,
      journalCount, 
      // Add other progress details here, e.g., goals, activities
    };

    res.status(200).json(progress);
  } catch (error) {
    console.error("Error fetching user progress:", error);
    res.status(500).json({ message: "Error fetching user progress" });
  }
});

const getUserMoodHistory = async (userId, days) => {
  try {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const moodHistory = await Mood.find({
      user: userId,
      timestamp: { $gte: fromDate },
    }).sort({ timestamp: 1 }); // Sort by date ascending

    return moodHistory;
  } catch (error) {
    console.error("Error fetching mood history:", error);
    throw new Error("Failed to fetch mood history");
  }
};


const moodScores = {
  Happy: 5,
  Excited: 4,
  Tired: 3,
  Anxious: 2,
  Sad: 1,
  Angry: 0,
};
const getWeeklyMoodData = async (req, res) => {
  try {
    // Debug logging
    console.log("Request type:", req.isParent ? "Parent" : "User");
    console.log("Request ID:", req.isParent ? req.parent._id : req.user._id);

    let userId;
    if (req.isParent) {
      // Find the linked user with detailed logging
      const linkedUser = await User.findOne({ parent: req.parent._id });
      console.log("Linked user search result:", linkedUser ? `Found user ${linkedUser._id}` : "No user found");
      
      if (!linkedUser) {
        return res.status(404).json({
          success: false,
          message: "No linked user found for this parent"
        });
      }
      userId = linkedUser._id;
    } else {
      userId = req.user._id;
    }

    // Get current date in user's timezone (or use UTC consistently)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculate start of week (Monday)
    const startOfWeek = new Date(today);
    const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1;
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    
    // Calculate end of week (Sunday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    console.log("Date range:", {
      startOfWeek: startOfWeek.toISOString(),
      endOfWeek: endOfWeek.toISOString()
    });

    // Fetch mood data with proper date range
    const weeklyMoods = await Mood.find({
      user: userId,
      timestamp: {
        $gte: startOfWeek,
        $lte: endOfWeek
      }
    }).sort({ timestamp: 1 }); // Sort by timestamp

    console.log("Found moods:", weeklyMoods.length);

    // Initialize arrays for mood data and activities
    const dailyMoodData = Array(7).fill(null);
    const activitiesCompleted = Array(7).fill(0);

    // Process each mood entry
    weeklyMoods.forEach((entry) => {
      const entryDate = new Date(entry.timestamp);
      const dayIndex = Math.floor((entryDate - startOfWeek) / (24 * 60 * 60 * 1000));
      
      console.log("Processing entry:", {
        date: entryDate,
        dayIndex,
        mood: entry.mood,
        score: moodScores[entry.mood]
      });

      if (dayIndex >= 0 && dayIndex < 7) {
        dailyMoodData[dayIndex] = moodScores[entry.mood];
        // If you're tracking activities, increment the counter
        if (entry.activitiesCompleted) {
          activitiesCompleted[dayIndex] = entry.activitiesCompleted;
        }
      }
    });

    // Log final data before sending
    console.log("Final mood data:", dailyMoodData);
    console.log("Activities completed:", activitiesCompleted);

    return res.status(200).json({
      success: true,
      data: dailyMoodData,
      activitiesCompleted,
      metadata: {
        userId,
        startOfWeek: startOfWeek.toISOString(),
        endOfWeek: endOfWeek.toISOString(),
        totalEntries: weeklyMoods.length
      }
    });

  } catch (error) {
    console.error("Error in getWeeklyMoodData:", {
      error: error.message,
      stack: error.stack
    });

    return res.status(500).json({
      success: false,
      message: "Failed to fetch weekly mood data",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const calculateAverageMood = async (req,res) => {
  const userId=req.user.selected_interestsid;
  try {
    let days=30;
    const moods = await getUserMoodHistory(userId, days);

    if (!moods.length) return null; // No mood data

    const totalScore = moods.reduce(
      (sum, mood) => sum + moodScores[mood.mood],
      0
    );

    return (totalScore / moods.length).toFixed(2); // Average mood score
  } catch (error) {
    console.error("Error calculating average mood:", error);
    throw new Error("Failed to calculate average mood");
  }
};



const extractMobileNumber = async (imagePath, user) => {
  try {
    const result = await Tesseract.recognize(imagePath, 'eng');
    const text = result.data.text;
      const phoneRegex = /\b(\+?\d{1,4}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?[\d-.\s]{7,10}\b/;
      const mobileNumber = text.match(phoneRegex)[0];;
      console.log(`Parent mobile is ${mobileNumber}`)
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { parent_phone_no : mobileNumber },
        { new: true } // Returns the updated document
      );
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
  } catch (error) {
      console.error('Error extracting mobile number:', error);
      return null;
  }
};
const getJournals = async (req, res) => {
  try {
      const  userId = req.user._id;
      // Fetch journals directly for the given userId
      const journals = await Journal.find({ user: userId });
      if (!journals.length) {
          return res.status(404).json({
              success: false,
              message: "No journals found for this user",
          });
      }

      res.status(200).json({
          journals
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

export const getLastCounselorProgress = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  // Find last session
  const lastSession = await Session.findOne({ user: userId })
    .sort({ endedAt: -1 })
    .populate('counselor');
  if (!lastSession || !lastSession.counselor) {
    return res.json({ hasProgress: false });
  }
  // Find progress for this counselor
  const user = await User.findById(userId);
  const progress = user.counselorProgress.find(
    (cp) => cp.counselor.toString() === lastSession.counselor._id.toString()
  );
  if (progress && progress.sittingProgress > 0) {
    return res.json({
      hasProgress: true,
      counselor: {
        _id: lastSession.counselor._id,
        fullName: lastSession.counselor.fullName,
        sittingProgress: progress.sittingProgress
      }
    });
  }
  return res.json({ hasProgress: false });
});

const updateCounselorProgress = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { counselorId, sittingProgress, continueWithSame } = req.body;

  if (!counselorId || typeof sittingProgress !== 'number') {
    return res.status(400).json({ success: false, message: 'counselorId and sittingProgress (number) are required.' });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  // Only update or add progress for the specified counselor; do NOT reset or remove any previous progress
  let progress = user.counselorProgress?.find(cp => cp.counselor.toString() === counselorId);
  if (progress) {
    progress.sittingProgress = sittingProgress;
    // If user chose to change counselor, mark this counselor as excluded for next session
    if (continueWithSame === false) {
      progress.excludeNext = true;
    } else {
      progress.excludeNext = false;
    }
  } else {
    if (!user.counselorProgress) user.counselorProgress = [];
    user.counselorProgress.push({ counselor: counselorId, sittingProgress, excludeNext: continueWithSame === false });
  }
  await user.save();
  return res.status(200).json({ success: true, message: 'Counselor progress updated', counselorProgress: user.counselorProgress });
});

// Add this to your user controller file

const getCaseHistory = async (req, res) => {
  try {
    const { clientId } = req.query;
    
    if (!clientId) {
      return res.status(400).json({
        success: false,
        message: "Client ID is required"
      });
    }

    // Fetch user with all related data
    const user = await User.findById(clientId)
      .populate('issues', 'illnessType severity createdAt')
      .populate('interests', 'name isGoal')
      .populate('journals', 'title content mood createdAt')
      .populate('events', 'title description date')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Client not found"
      });
    }

    // Find counselor who has this client
    const counselor = await Counsellor.findOne({
      'clients.userId': clientId
    }).populate('clients.userId', 'fullName email').lean();

    // Get client info from counselor's clients array
    const clientInfo = counselor?.clients?.find(
      client => client.userId._id.toString() === clientId
    );

    // Calculate total sessions from sessionProgress or counselorProgress
    const totalSessions = user.counselorProgress?.reduce((sum, progress) => {
      return sum + (progress.sittingProgress || 0);
    }, 0) || Math.floor((user.sessionProgress || 15) / 5); // Assuming 5% per session

    // Get current mood from latest mood entry in Mood collection
    const latestMood = await Mood.findOne({ user: clientId })
      .sort({ timestamp: -1 })
      .limit(1)
      .lean();
    
    const currentMood = latestMood?.mood || user.journals?.[0]?.mood || user.mood || 'Not recorded';

    // Format active issues
    const activeIssues = user.issues?.map(issue => ({
      title: issue.illnessType,
      severity: issue.severity,
      status: 'active', // You might want to add status to schema
      dateIdentified: issue.createdAt
    })) || [];

    // Calculate progress score
    const progressScore = user.progress || 
      (user.counselorProgress?.[0]?.sittingProgress || 0) * 5 || // Convert sitting progress to percentage
      Math.min(user.sessionProgress || 15, 100);

    // Calculate activity score based on recent activity
    const activityScore = calculateActivityScore(user);

    // Format counselor issues (from counselor reviews)
    const counselorIssues = user.counsellorReviews?.map(review => ({
      title: review.diagnosis || 'General Assessment',
      description: review.notes,
      severity: review.symptoms?.length > 3 ? 'High' : 
                review.symptoms?.length > 1 ? 'Medium' : 'Low',
      status: review.willingToTreat ? 'in-progress' : 'assessment',
      dateIdentified: review.reviewedAt,
      issue: review.diagnosis,
      notes: review.notes
    })) || [];

    // Fetch actual sessions from database (completed only)
    const sessions = await Session.find({ 
      user: clientId,
      status: 'Completed'
    })
      .populate('counselor', 'fullName specialization')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Format recent sessions with proper duration calculation
    const recentSessions = await formatRecentSessions(sessions, user, counselor, clientId);

    // Format activity timeline
    const activityTimeline = formatActivityTimeline(user);

    // Format progress metrics
    const progressMetrics = formatProgressMetrics(user);

    // Prepare case history response
    const caseHistory = {
      clientName: user.fullName,
      name: user.fullName,
      totalSessions: totalSessions,
      currentMood: currentMood,
      activeIssues: activeIssues,
      progressScore: Math.round(progressScore),
      activityScore: activityScore,
      
      // Issues designated by counselors
      counselorIssues: counselorIssues,
      
      // Recent sessions
      recentSessions: recentSessions,
      
      // Activity timeline
      activityTimeline: activityTimeline,
      
      // Progress metrics
      progressMetrics: progressMetrics,
      
      // Counselor notes
      counselorNotes: user.sittingNotes?.join('\n\n') || 
                     user.counsellorReviews?.[0]?.notes || 
                     'No counselor notes available yet.'
    };

    res.status(200).json(caseHistory);

  } catch (error) {
    console.error('Error fetching case history:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Helper function to calculate activity score
function calculateActivityScore(user) {
  let score = 0;
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Points for recent login
  if (user.lastLoginDate && user.lastLoginDate > thirtyDaysAgo) {
    score += 2;
  }

  // Points for journals in last 30 days
  const recentJournals = user.journals?.filter(journal => 
    new Date(journal.createdAt) > thirtyDaysAgo
  ).length || 0;
  score += Math.min(recentJournals * 0.5, 3);

  // Points for events in last 30 days
  const recentEvents = user.events?.filter(event => 
    new Date(event.date) > thirtyDaysAgo
  ).length || 0;
  score += Math.min(recentEvents * 0.3, 2);

  // Points for current streak
  score += Math.min(user.streak * 0.1, 2);

  // Points for having interests/goals
  if (user.interests?.length > 0) {
    score += 1;
  }

  return Math.min(Math.round(score), 10);
}

// Helper function to format recent sessions
async function formatRecentSessions(sessions, user, counselor, userId) {
  const formattedSessions = [];
  
  // Import Mood model for querying user moods
  const { Mood } = await import('../models/mood.model.js');
  
  // Format actual sessions from database with proper duration calculation
  if (sessions && sessions.length > 0) {
    for (const [index, session] of sessions.entries()) {
      let duration = 'N/A';
      let durationMinutes = 0;
      
      // Calculate duration from startTime and endTime
      if (session.startTime && session.endTime) {
        const start = new Date(session.startTime);
        const end = new Date(session.endTime);
        durationMinutes = Math.round((end - start) / (1000 * 60)); // Convert ms to minutes
        
        if (durationMinutes >= 60) {
          const hours = Math.floor(durationMinutes / 60);
          const mins = durationMinutes % 60;
          duration = mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
        } else if (durationMinutes > 0) {
          duration = `${durationMinutes} min`;
        }
      } else if (session.duration) {
        // Use stored duration if available
        durationMinutes = session.duration;
        if (durationMinutes >= 60) {
          const hours = Math.floor(durationMinutes / 60);
          const mins = durationMinutes % 60;
          duration = mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
        } else {
          duration = `${durationMinutes} min`;
        }
      }
      
      // Calculate mood based on multiple sources (priority: user mood > counsellor review > feedback > neutral)
      let mood = 'Neutral';
      
      // 1. First priority: Check user's recorded mood around session time (±24 hours)
      const sessionDate = session.createdAt || session.startTime;
      if (sessionDate && userId) {
        const dayBefore = new Date(sessionDate);
        dayBefore.setHours(dayBefore.getHours() - 24);
        const dayAfter = new Date(sessionDate);
        dayAfter.setHours(dayAfter.getHours() + 24);

        try {
          const userMoods = await Mood.find({
            user: userId,
            timestamp: { $gte: dayBefore, $lte: dayAfter }
          }).sort({ timestamp: -1 }).limit(1).lean();

          if (userMoods && userMoods.length > 0) {
            mood = userMoods[0].mood; // User's self-reported mood
          }
        } catch (error) {
          console.log('Could not fetch user mood:', error.message);
        }
      }
      
      // 2. Second priority: Check counsellor review symptoms if no user mood found
      if (mood === 'Neutral' && session.counsellorReview && session.counsellorReview.symptoms) {
        const symptoms = session.counsellorReview.symptoms;
        if (symptoms.includes('anxiety')) {
          mood = 'Anxious';
        } else if (symptoms.includes('depression')) {
          mood = 'Sad';
        } else if (symptoms.includes('stress')) {
          mood = 'Tired';
        }
      }
      
      // 3. Third priority: Check session feedback
      if (mood === 'Neutral' && session.feedback) {
        mood = 'Happy';
      }
      
      formattedSessions.push({
        sessionNumber: sessions.length - index,
        date: session.createdAt || new Date(),
        duration: duration,
        // notes: session.userNotes || session.counselorFeedback || 'Session completed',
        summary: session.issueDetails || 'Counseling session',
        mood: mood,
        progress: session.rating ? session.rating * 20 : 50, // Convert 5-star rating to percentage
        type: session.counsellorReview ? 'Assessment' : 'Individual',
        status: session.status,
        rating: session.rating || 0,
        counselorName: session.counselor?.fullName || counselor?.fullName || 'Counselor'
      });
    }
  }
  
  // // If no actual sessions, create fallback from sitting notes
  // if (formattedSessions.length === 0 && user.sittingNotes && user.sittingNotes.length > 0) {
  //   user.sittingNotes.forEach((note, index) => {
  //     const sessionDate = new Date();
  //     sessionDate.setDate(sessionDate.getDate() - (index * 7)); // Weekly sessions
      
  //     formattedSessions.push({
  //       sessionNumber: user.sittingNotes.length - index,
  //       date: sessionDate,
  //       duration: '50 min',
  //       notes: note,
  //       summary: note,
  //       mood: 'In Progress',
  //       progress: Math.min((user.sittingNotes.length - index) * 10, 100),
  //       type: 'Individual'
  //     });
  //   });
  // }
  
  // // Add sessions from counselor reviews if still empty
  // if (formattedSessions.length === 0 && user.counsellorReviews && user.counsellorReviews.length > 0) {
  //   user.counsellorReviews.forEach((review, index) => {
  //     formattedSessions.push({
  //       sessionNumber: formattedSessions.length + index + 1,
  //       date: review.reviewedAt || new Date(),
  //       duration: '50 min',
  //       notes: review.notes || 'Assessment session completed',
  //       summary: `Diagnosis: ${review.diagnosis || 'General assessment'}`,
  //       mood: review.symptoms?.includes('anxiety') ? 'Anxious' : 
  //             review.symptoms?.includes('depression') ? 'Low' : 'Neutral',
  //       progress: review.willingToTreat ? 70 : 40,
  //       type: 'Assessment'
  //     });
  //   });
  // }

  return formattedSessions.slice(0, 5);
}

// Helper function to format activity timeline
function formatActivityTimeline(user) {
  const timeline = [];
  
  // Add recent journal entries
  if (user.journals && user.journals.length > 0) {
    user.journals.slice(0, 3).forEach(journal => {
      timeline.push({
        action: 'Journal Entry',
        activity: 'Added new journal entry',
        description: `"${journal.title}" - Mood: ${journal.mood || 'Not specified'}`,
        details: journal.title,
        timestamp: journal.createdAt
      });
    });
  }

  // Add recent events
  if (user.events && user.events.length > 0) {
    user.events.slice(0, 3).forEach(event => {
      timeline.push({
        action: 'Event Scheduled',
        activity: 'Added new event',
        description: event.description || event.title,
        details: `Event: ${event.title}`,
        timestamp: event.date
      });
    });
  }

  // Add login activity
  if (user.lastLoginDate) {
    timeline.push({
      action: 'Platform Login',
      activity: 'Logged into platform',
      description: 'User accessed the platform',
      details: 'Login activity',
      timestamp: user.lastLoginDate
    });
  }

  // Add progress updates
  timeline.push({
    action: 'Progress Update',
    activity: 'Session progress updated',
    description: `Current progress: ${user.sessionProgress || 15}%`,
    details: 'Progress tracking',
    timestamp: user.updatedAt || new Date()
  });

  // Sort by timestamp (most recent first)
  return timeline.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);
}

// Helper function to format progress metrics
function formatProgressMetrics(user) {
  const metrics = [];

  // Overall progress
  metrics.push({
    name: 'Overall Progress',
    metric: 'Overall Progress',
    value: user.progress || Math.min(user.sessionProgress || 15, 100),
    score: user.progress || Math.min(user.sessionProgress || 15, 100)
  });

  // Session completion
  if (user.counselorProgress && user.counselorProgress.length > 0) {
    const avgProgress = user.counselorProgress.reduce((sum, cp) => 
      sum + (cp.sittingProgress || 0), 0) / user.counselorProgress.length;
    
    metrics.push({
      name: 'Session Completion',
      metric: 'Session Completion',
      value: Math.round(avgProgress * 5), // Convert to percentage
      score: Math.round(avgProgress * 5)
    });
  }

  // Engagement level (based on activity)
  const engagementScore = calculateActivityScore(user) * 10;
  metrics.push({
    name: 'Platform Engagement',
    metric: 'Platform Engagement',
    value: engagementScore,
    score: engagementScore
  });

  // Goal achievement (based on interests marked as goals)
  const goals = user.interests?.filter(interest => interest.isGoal) || [];
  const goalScore = goals.length > 0 ? Math.min(goals.length * 20, 100) : 0;
  metrics.push({
    name: 'Goal Setting',
    metric: 'Goal Setting',
    value: goalScore,
    score: goalScore
  });

  // Consistency (based on streak)
  const consistencyScore = Math.min((user.streak || 0) * 10, 100);
  metrics.push({
    name: 'Consistency',
    metric: 'Consistency',
    value: consistencyScore,
    score: consistencyScore
  });

  return metrics;
}

// Check for user's active session
const getUserActiveSession = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    
    try {
        // Find any active session for this user
        const activeSession = await Session.findOne({
            user: userId,
            status: 'Active'
        }).populate('counselor', 'fullName specialization');
        
        if (activeSession) {
            // Check if session is older than 3 hours
            const sessionCreatedTime = new Date(activeSession.createdAt);
            const currentTime = new Date();
            const threeHoursAgo = new Date(currentTime.getTime() - (3 * 60 * 60 * 1000)); // 3 hours in milliseconds
            
            if (sessionCreatedTime < threeHoursAgo) {
                console.log('Session older than 3 hours, marking as completed:', activeSession._id);
                
                // Mark session as completed if older than 3 hours
                activeSession.status = 'Completed';
                activeSession.endTime = currentTime;
                
                // Calculate duration if not already set
                if (activeSession.startTime && !activeSession.duration) {
                    activeSession.duration = Math.round((currentTime - activeSession.startTime) / 1000);
                }
                
                await activeSession.save();
                
                // Make counselor available again
                if (activeSession.counselor) {
                    const counselor = await Counsellor.findById(activeSession.counselor);
                    if (counselor) {
                        counselor.isAvailable = true;
                        await counselor.save();
                    }
                }
                
                return res.status(200).json({
                    success: true,
                    activeSession: null,
                    message: 'Previous session automatically ended due to inactivity'
                });
            }
            
            return res.status(200).json({
                success: true,
                activeSession: {
                    _id: activeSession._id,
                    status: activeSession.status,
                    roomName: activeSession.roomName,
                    counselor: activeSession.counselor,
                    issueDetails: activeSession.issueDetails,
                    createdAt: activeSession.createdAt
                }
            });
        }
        
        return res.status(200).json({
            success: true,
            activeSession: null
        });
        
    } catch (error) {
        console.error('Error checking active session:', error);
        return res.status(500).json({ 
            success: false,
            message: "Internal server error" 
        });
    }
});

// Rejoin active session for user
const rejoinUserSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.body;
    const userId = req.user._id;
    
    if (!sessionId) {
        return res.status(400).json({ message: "Session ID is required" });
    }

    try {
        // Find the session
        const session = await Session.findById(sessionId).populate('counselor', 'fullName specialization');
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        // Verify that the user owns this session
        if (session.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Not authorized to rejoin this session" });
        }

        // Verify session is still active
        if (session.status !== 'Active') {
            return res.status(400).json({ message: "Session is no longer active" });
        }

        // Check if session is older than 3 hours
        const sessionCreatedTime = new Date(session.createdAt);
        const currentTime = new Date();
        const threeHoursAgo = new Date(currentTime.getTime() - (3 * 60 * 60 * 1000));
        
        if (sessionCreatedTime < threeHoursAgo) {
            // Auto-end the session
            session.status = 'Completed';
            session.endTime = currentTime;
            
            if (session.startTime && !session.duration) {
                session.duration = Math.round((currentTime - session.startTime) / 1000);
            }
            
            await session.save();
            
            // Make counselor available again
            if (session.counselor) {
                const counselor = await Counsellor.findById(session.counselor);
                if (counselor) {
                    counselor.isAvailable = true;
                    await counselor.save();
                }
            }
            
            return res.status(400).json({ 
                message: "Session has been automatically ended due to inactivity (3+ hours)" 
            });
        }

        // Check if session has a room name
        if (!session.roomName) {
            return res.status(400).json({ message: "Session room not available" });
        }

        // Log the rejoin attempt
        console.log('🔄 User rejoining session:', {
            sessionId,
            userId,
            roomName: session.roomName
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
                counselor: session.counselor,
                issueDetails: session.issueDetails,
                createdAt: session.createdAt
            }
        });

    } catch (error) {
        console.error('Error rejoining session:', error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Dismiss active session for user
const dismissUserSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.body;
    const userId = req.user._id;
    
    if (!sessionId) {
        return res.status(400).json({ message: "Session ID is required" });
    }

    try {
        // Find the session
        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        // Verify that the user owns this session
        if (session.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Not authorized to dismiss this session" });
        }

        // Only allow dismissing active sessions
        if (session.status !== 'Active') {
            return res.status(400).json({ message: "Session is not active" });
        }

        // Mark session as completed
        const currentTime = new Date();
        session.status = 'Completed';
        session.endTime = currentTime;

        // Calculate duration if there was a start time
        if (session.startTime && !session.duration) {
            session.duration = Math.round((currentTime - session.startTime) / 1000);
        }

        await session.save();

        // Make counselor available again if they were assigned
        if (session.counselor) {
            const counselor = await Counsellor.findById(session.counselor);
            if (counselor) {
                counselor.isAvailable = true;
                await counselor.save();
                console.log('✅ Counselor marked as available after session dismissal:', counselor._id);
            }
        }

        // Emit session ended event to notify counselor if needed
        if (session.roomName) {
            io.emit(`sessionEnded-${sessionId}`, { 
                sessionId,
                roomName: session.roomName,
                endedBy: userId,
                reason: 'dismissed_by_user'
            });
        }

        console.log('🗑️ Session dismissed by user:', {
            sessionId,
            userId,
            counselorId: session.counselor
        });

        res.status(200).json({
            success: true,
            message: "Session dismissed and marked as completed successfully"
        });

    } catch (error) {
        console.error('Error dismissing session:', error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Get user appointments
const getUserAppointments = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  try {
    const appointments = await Appointment.find({ clientId: userId })
      .populate('counsellorId', 'fullName email specialization')
      .sort({ appointmentDate: 1, startTime: 1 });
    
    return res.status(200).json({
      success: true,
      appointments
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments'
    });
  }
});

// Get today's appointments
const getTodaysUserAppointments = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const appointments = await Appointment.find({
      clientId: userId,
      appointmentDate: { $gte: today, $lt: tomorrow },
      status: { $in: ['scheduled'] }
    })
      .populate('counsellorId', 'fullName email specialization')
      .sort({ startTime: 1 });
    
    return res.status(200).json({
      success: true,
      appointments
    });
  } catch (error) {
    console.error('Error fetching today\'s appointments:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch today\'s appointments'
    });
  }
});

const markAppointmentJoined = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { appointmentId } = req.params;
  
  try {
    const appointment = await Appointment.findById(appointmentId);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    if (appointment.clientId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment'
      });
    }
    
    appointment.userJoined = true;
    await appointment.save();
    
    return res.status(200).json({
      success: true,
      message: 'Appointment marked as joined',
      appointment
    });
  } catch (error) {
    console.error('Error marking appointment as joined:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark appointment as joined'
    });
  }
});

export {
  registerUser, extractMobileNumber,
  loginUser,
  logoutUser,
  generateAccessAndRefreshTokens,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser, getJournals,
  updateAccountDetails,
  updateUserAvatar,
  addInterests, userProgress, calculateAverageMood,
  getWeeklyMoodData, getUserSessions,
  updateCounselorProgress, getCaseHistory, rejoinUserSession, getUserActiveSession, dismissUserSession,
  getUserAppointments, getTodaysUserAppointments, markAppointmentJoined
};