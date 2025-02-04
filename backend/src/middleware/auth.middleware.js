import { ApiError } from "../utils/API_Error.js";
import asyncHandler from "../utils/asynchandler.utils.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Parent } from "../models/parent.model.js";
import { Counsellor } from "../models/counsellor.model.js";

// Helper function
const verifyJWT = async (token, model, role) => {
  try {
    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const entity = await model.findById(decodedToken?._id).select("-password -refreshToken");

    if (!entity) {
      throw new ApiError(401, `Invalid Access Token for ${role}`);
    }

    return entity;
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      throw new ApiError(401, "Invalid Token");
    }
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Token Expired");
    }
    throw new ApiError(401, error?.message || "Invalid access token");
  }
};

export const user_verifyJWT = asyncHandler(async (req, _, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");
  const user = await verifyJWT(token, User, "User");
  req.user = user; // Attach the user to the request object
  next();
});


export const parent_verifyJWT = asyncHandler(async (req, _, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  const parent = await verifyJWT(token, Parent, "Parent");
  req.parent = parent;
  req.isParent = true; // Flag the request as from a parent
  next();
});

export const counsellor_verifyJWT = asyncHandler(async (req, _, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  const counsellor = await verifyJWT(token, Counsellor, "Counsellor");
  req.counsellor = counsellor;
  next();
});
