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
    const { fullName, email, username, password, age,interests } = req.body;
  
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
  
    // Check if issue exists or create a new one
    let issue = await issue.findOne({ issue_name: issue.issue_name });
    if (!issue) {
      issue = await Issue.create(issue);
    }
    
    if (age < 18) {
      return res.status(200).json({
        status: "requires_id_card",
        message: "Users under 18 must upload a student ID card",
      });
    }
    
    //Set profile avatar
    

  
    // Create the user
    const user = await User.create({
      fullName,
      email,
      password,
      username: username.toLowerCase(),
      interests: [],
    });
  
    // Process and associate tags
    const user_interests = [];
    for (const tagName of user_interests) {
      let tag = await Interest.findOne({ name: tagName });
  
      if (!tag) {
        // Tag doesn't exist, create it and associate the `createdBy` field
        tag = await Interest.create({
          name: tagName,
        });
      }
  
      interests.push(tag._id); // Collect tag IDs to associate with the user
    }
  
    // Update the user's subscribed tags
    user.interests = interests;
    await user.save();
  
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
  
  const uploadIdCard = asyncHandler(async (req, res) => {
    const { userId } = req.body;
    const idCardFile = req.file; // Assuming you're using a middleware like multer for file uploads
  
    if (!userId || !idCardFile) {
      throw new ApiError(400, "User ID and ID card file are required");
    }
  
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
  
    // Save the ID card file path or URL to the user's profile
    user.studentIdCard = idCardFile.path; 
    await user.save();
  
    return res.status(200).json({
      status: "success",
      message: "Student ID card uploaded successfully",
    });
  });
  
const loginUser = asyncHandler(async (req, res) => {
  const { username, password, email } = req.body;
  if (!username) {
    throw new ApiError(400, "username is required");
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

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id,
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

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
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully",
      ),
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

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  generateAccessAndRefereshTokens,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  uploadIdCard, userProgress
};