import mongoose from "mongoose";
import asyncHandler from "../utils/asynchandler.utils.js";
import ApiError from "../utils/API_Error.js";
import { User } from "../models/user.model.js";
import { Interest } from "../models/interests.models.js";
import { Issue } from "../models/Issues.model.js";
import ApiResponse from "../utils/API_Response.js";
import jwt from "jsonwebtoken";
import Tesseract from ""

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password, gender, age } = req.body;
  const { idCardFile } = req.file;

  // Validate fields
  if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if user already exists
  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  if (age < 18 && !idCardFile) {
    throw new ApiError(400, "ID card upload is mandatory for students under 18");
  }

  // Create the user
  const user = await User.create({
    fullName,
    email,
    password,
    gender,
    age,
    username: username.toLowerCase(),
    idCard: idCardFile,
  });

  const createdUser = await User.findById(user._id).select("-password -refreshToken");
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, { createdUser }, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, password, email } = req.body;

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

  // Handle streak logic
  
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
      }, "User logged in successfully"),
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $unset: { refreshToken: 1 },
  }, { new: true });

  const options = { httpOnly: true, secure: true };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const addInterests = asyncHandler(async (req, res) => {
  const { userId, selected_interests, isGoal } = req.body;
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  const user_interests = [];
  for (const tagName of selected_interests) {
    let tag = await Interest.findOne({ name: tagName });

    if (!tag) {
      tag = await Interest.create({ name: tagName, user: userId, isGoal });
    }
    user_interests.push(tag._id);
  }

  user.interests = user_interests;
  await user.save();

  return res.status(200).json({
    status: "success",
    message: "User interests added successfully",
  });
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id);

    if (!user || incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
      .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true })
      .json(new ApiResponse(200, { accessToken, refreshToken }, "Access token refreshed"));
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findByIdAndUpdate(req.user?._id, {
    $set: { fullName, email },
  }, { new: true }).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const userProgress = asyncHandler(async (req,res) => {
  const user= await User.findById();

})

const extractMobileNumber = async (imagePath) => {
  try {
      const result = await Tesseract.recognize(imagePath, 'eng');
      const text = result.data.text;
      const phoneRegex = /\b(\+?\d{1,4}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?[\d-.\s]{7,10}\b/;
      const mobileNumber = text.match(phoneRegex);
      const user = await User.findByIdAndUpdate(
        user._id,
        { mobileNumber },
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
  addInterests,
  updateAccountDetails,
};
