import mongoose from "mongoose";
import asyncHandler from "../utils/asynchandler.utils.js";
import ApiError from "../utils/API_Error.js";
import { User } from "../models/user.model.js";
import { Resource } from "../models/resources.model.js";
import { Parent } from "../models/parent.model.js";
import { Post } from "../models/posts.model.js";
import { Interest } from "../models/interests.models.js";
import { Issue } from "../models/Issues.model.js";
import ApiResponse from "../utils/API_Response.js";
import jwt from "jsonwebtoken";
import Tesseract from "Tesseract"

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token",
    );
  }
};
const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password, gender, age  } = req.body;
    const {idCardFile}= req.file;
    // Validate fields
    if (
      [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
      throw new ApiError(400, "All fields are required");
    }
  
    // Check if user already exists
    const existedUser = await User.findOne({
      $or: [{ username }, { email }],
    });
  
    if (existedUser) {
      throw new ApiError(409, "User with email or username already exists");
    }
  
    if(age<18){
      if(!idCardFile){
        res.send(400,"ID card upload mandatory for students");
      }
    }

    //Set profile avatar
    await assignRandomAvatar();

  
    // Create the user
    const user = await User.create({
      fullName,
      email,
      password,
      gender,
      age,
      username: username.toLowerCase(),
      idCard: idCardFile
    });
  
    // Fetch the created user without sensitive fields
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken",
    );
  
    if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering the user");
    }
  
    // Send response with created user
    return res
      .status(201)
      .json(
        new ApiResponse(200, { createdUser }, "User registered successfully"),
      );
  });
  
  const addInterests= asyncHandler(async (req, res) => {
    const { userId, selected_interests, isGoal } = req.body;
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

  const addIssues= asyncHandler(async (req, res) => {
    const { userId, diagnoised_issues } = req.body;
    const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "Question not found");
  }
    for (const tagName of diagnoised_issues) {
      let issue = await Issue.findOne({ name: tagName });
      const user_issues=[]
      if (!tag) {
        // Tag doesn't exist, create it 
        issue = await Interest.create({
          name: Name,
        });
      }
  
      user_issues.push(tag._id); 
    // Collect tag IDs to associate with the user
    }
    user.issues=user_issues;
    await user.save();
    return res.status(200).json({
      status: "success",
      message: "User Issues added successfully",
    });
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
      await generateAccessAndRefereshTokens(user._id);

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
  const user= await User.findById();

})

const extractMobileNumber = async (imagePath) => {
  try {
      const result = await Tesseract.recognize(imagePath, 'eng');
      const text = result.data.text;
      const phoneRegex = /\b(\+?\d{1,4}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?[\d-.\s]{7,10}\b/;
      const mobileNumber = text.match(phoneRegex)[0];;
      console.log("Parent mobile is $(mobileNumber)")
      const user = await User.findByIdAndUpdate(
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
  generateAccessAndRefereshTokens,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  addInterests, userProgress, addIssues
};