import {Story} from "../models/stories.model.js"
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
// Create a new story
export const createStory = async (req, res) => {
  try {
    const { type, content } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!type || !["image", "video"].includes(type)) {
      return res.status(400).json({ message: "Invalid story type." });
    }

    if (!content && !req.files?.content) {
      return res.status(400).json({ message: "Content is required." });
    }

    let storyContent = content;

    // If content is a file (image or video)
    if (req.files?.content) {
      const file = req.files.content[0];  // Assuming single file upload
      const filePath = file.path;
      console.log(filePath)
      // Upload the file to Cloudinary
      const cloudinaryResponse = await uploadOnCloudinary(filePath, { folder: 'Mindfull' });

      if (!cloudinaryResponse) {
        throw new Error('File upload to Cloudinary failed');
      }

      // Get the Cloudinary URL of the uploaded file
      storyContent = cloudinaryResponse.url;
    }
    console.log(storyContent)

    // Create and save the story
    const story = new Story({
      user: userId,
      type,
      content: storyContent,
    });

    await story.save();

    res.status(201).json({ message: "Story created successfully!", story });
  } catch (error) {
    res.status(500).json({ message: "Failed to create story.", error: error.message });
  }
};

// Get stories for the homepage
export const getStories = async (req, res) => {
  try {
    // Fetch all stories, populating user details
    const stories = await Story.find()
      .populate("user", "username avatar") // Fetch user name and avatar for display
      .sort({ createdAt: -1 }); // Sort by most recent

    res.status(200).json({ stories });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stories.", error: error.message });
  }
};
