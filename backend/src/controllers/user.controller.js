import { createAndPushNotification } from "../services/eventupdate.js";
import {Event} from '../models/event.model.js';
import {Notification} from '../models/notification.model.js';
import asyncHandler from "../utils/asynchandler.utils.js";
import {ApiError} from "../utils/API_Error.js";
import { User } from "../models/user.model.js";
import { Resource } from "../models/resource.model.js";
import { Parent } from "../models/parent.model.js";
import { Mood } from "../models/mood.model.js";
import { Interest } from "../models/interests.models.js";
import { Issue } from "../models/Issues.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import ApiResponse from "../utils/API_Response.js";
import jwt from "jsonwebtoken";
import Tesseract from 'tesseract.js';

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
          if (!parsedLocation.type || !parsedLocation.coordinates) {
              throw new Error("Invalid location format");
          }
      } catch (error) {
          return res.status(400).json({ success: false, message: "Invalid location JSON format" });
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
      });

      console.log("User successfully created:", user);

      // Generate tokens
      const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
      console.log("Generated Tokens:", { accessToken, refreshToken });

      // Cookie options
      const options = {
          httpOnly: true,
          secure: false, // Set `true` in production with HTTPS
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

  
  const addInterests= asyncHandler(async (req, res) => {
    const {  userId,selected_interests, isGoal } = req.body;
   const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "Question not found");
  }
    const user_interests = [];
    for (const tagName of selected_interests) {
      let tag = await Interest.findOne({ name: tagName });
  
      if (!tag) {
        // Tag doesn't exist, create it 
        tag = await Interest.create({
          name: tagName,
          user: userId,
          isGoal
        });
      }
  
      user_interests.push(tag._id); 
    // Collect tag IDs to associate with the user
    }
    user.interests=user_interests;
    await user.save();
    return res.status(200).json({
      status: "success",
      message: "User Interests added successfully",
    });
  });
  export const addIssues = asyncHandler(async (req, res) => {
    const { userId, diagnoised_issues } = req.body;
  
    // Check if diagnosed_issues is an array and not empty
    if (!Array.isArray(diagnoised_issues) || diagnoised_issues.length === 0) {
      return res.status(400).json({ message: "Diagnosed issues must be an array with at least one issue." });
    }
  
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
  
    // List of valid issues (ensure these match frontend names exactly)
    const validIssues = [
      "Anxiety",
      "Depression",
      "Bipolar Disorder",
      "Obsessive-Compulsive Disorder",
      "PTSD",
      "Substance Use",
      "ADHD",
      "Eating Disorders",
    ];
  
    // Store the issue IDs that will be associated with the user
    const user_issues = [];
  
    // Loop through the selected issues and check if they exist in the database
    for (const issueName of diagnoised_issues) {
      // Ensure issueName is a string and check if it's a valid issue
      if (typeof issueName !== 'string' || !validIssues.includes(issueName)) {
        return res.status(400).json({ message: `${issueName} is not a valid issue` });
      }
  
      // Check if the issue exists in the database
      let issue = await Issue.findOne({ name: issueName });
  
      if (!issue) {
        // If the issue does not exist, create a new issue
        issue = await Issue.create({ name: issueName });
      }
  
      // Push the issue ID to the user_issues array
      user_issues.push(issue._id);
    }
  
    // Update the user's issues field
    user.issues = user_issues;
    await user.save();
  
    return res.status(200).json({
      status: "success",
      message: "User issues added successfully",
    });
  });
  
  const loginUser = asyncHandler(async (req, res) => {
    const { username, password, email, mood } = req.body;
    console.log("Request body:", req.body);
    if (!username) {
      throw new ApiError(400, "Username is required");
    }
  
    const user = await User.findOne({ $or: [{ username }, { email }] });
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
    const diffInHours = lastLogin ? (now - lastLogin) / (1000 * 60 * 60) : null;
  
    if (diffInHours !== null && diffInHours >= 24 && diffInHours < 48) {
      user.streak += 1; // Continue streak
    } else if (diffInHours !== null && diffInHours >= 48) {
      user.streak = 1; // Reset streak
    } else if (!lastLogin) {
      user.streak = 1; // First login
    }
  
    if (user.streak > user.maxStreak) {
      user.maxStreak = user.streak; // Update max streak
    }
  
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
    secure: true,
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
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email: email,
      },
    },
    { new: true },
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
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
  let userId;

  try {
    if (req.isParent) {
      // Find the user (child) associated with the parent
      const linkedUser = await User.findOne({ parent: req.parent._id });
      if (!linkedUser) {
        return res.status(404).json({
          success: false,
          message: "No linked user found for this parent",
        });
      }
      userId = linkedUser._id; // Use the child's user ID
    } else {
      userId = req.user._id; // If request is from a regular user
    }

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to midnight

    // Get the start of the week (Monday)
    const startOfWeek = new Date(today);
    const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1; // Handle Sunday as last day
    startOfWeek.setDate(today.getDate() - dayOfWeek);

    // Fetch mood data for the user
    const weeklyMoods = await Mood.find({
      user: userId,
      timestamp: { $gte: startOfWeek },
    });

    // Initialize array to hold daily mood scores
    const dailyMoodData = Array(7).fill(null); // Default null for days without data

    // Populate mood scores for respective days
    weeklyMoods.forEach((entry) => {
      const dayIndex = Math.floor((entry.timestamp - startOfWeek) / (24 * 60 * 60 * 1000)); // Day index
      if (dayIndex >= 0 && dayIndex < 7) {
        dailyMoodData[dayIndex] = moodScores[entry.mood];
      }
    });

    res.status(200).json({
      success: true,
      data: dailyMoodData,
    });
  } catch (error) {
    console.error("Error fetching weekly mood data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch weekly mood data",
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
    /*let imageBuffer;
    if (imagePath.startsWith('http')) {
      const response = await axios.get(imagePath, { responseType: 'arraybuffer' });
      imageBuffer = Buffer.from(response.data, 'binary');
    } else {
      // If it's a local file path, use it directly
      imageBuffer = imagePath;
    }*/

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

export {
  registerUser, extractMobileNumber,
  loginUser,
  logoutUser,
  generateAccessAndRefreshTokens,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  addInterests, userProgress, calculateAverageMood,
  getWeeklyMoodData
};