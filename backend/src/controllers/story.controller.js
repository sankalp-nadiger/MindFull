import {Story} from "../models/stories.model.js"

// Create a new story
export const createStory = async (req, res) => {
  try {
    const { type, content } = req.body;

    // Validate input
    if (!type || !["image", "video"].includes(type)) {
      return res.status(400).json({ message: "Invalid story type." });
    }

    if (!content) {
      return res.status(400).json({ message: "Content is required." });
    }

    const story = new Story({
      user: "678e87c5b00317631329f4c1", // Assuming req.user is populated by authentication middleware
      type,
      content,
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
      .populate("user", "name avatar") // Fetch user name and avatar for display
      .sort({ createdAt: -1 }); // Sort by most recent

    res.status(200).json({ stories });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stories.", error: error.message });
  }
};
