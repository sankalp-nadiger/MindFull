import dotenv from "dotenv";
import cloudinary from "cloudinary";
import fs from "fs";
import path from "path";

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file to Cloudinary
 * @param {string} localFilePath - The path to the local file
 * @param {object} options - Additional options for the upload (e.g., folder, resource_type)
 * @returns {Promise<object|null>} - The response from Cloudinary or null if an error occurs
 */
export const uploadOnCloudinary = async (localFilePath, options = {}) => {
  try {
    if (!localFilePath) throw new Error("File path is required.");

    // Set default options if not provided
    const uploadOptions = {
      resource_type: "auto",
      ...options,
    };

    // Upload the file to Cloudinary
    const response = await cloudinary.v2.uploader.upload(localFilePath, uploadOptions);

    // Remove the local file after successful upload
    fs.unlinkSync(localFilePath);

    return response;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error.message);

    // Attempt to delete the local file if it exists
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return null;
  }
};

/**
 * Deletes a file from Cloudinary
 * @param {string} publicId - The public ID of the file on Cloudinary
 * @returns {Promise<object|null>} - The response from Cloudinary or null if an error occurs
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) throw new Error("Public ID is required.");

    const response = await cloudinary.v2.uploader.destroy(publicId);

    return response;
  } catch (error) {
    console.error("Cloudinary Delete Error:", error.message);
    return null;
  }
};
