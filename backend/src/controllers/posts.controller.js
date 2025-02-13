import { Post } from "../models/posts.model.js"; // Assuming you have a Post model
import { User } from "../models/user.model.js";

// Create a new gratitude post
export const createPost = async (req, res) => {
  try {
    const { content, isAnonymous} = req.body;
    const userId = req.user._id; // Assuming you're using authentication middleware to attach the user
    // Validate input
    console.log(content)
    // Fetch the user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // If the post is anonymous, set the author name to 'Anonymous'
    const postAuthor = isAnonymous ? "Anonymous" : user.username;

    // Create a new post with the provided details
    const newPost = new Post({
      content,
      isAnonymous,
      user: userId,
      author: postAuthor, // Store either the user's name or "Anonymous"
    });

    const savedPost = await newPost.save();

    res.status(201).json({
      success: true,
      message: "Gratitude post created successfully.",
      post: savedPost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating gratitude post.",
      error: error.message,
    });
  }
};

// Get gratitude posts for the homepage
export const getPosts = async (req, res) => {
  try {
    // Fetch all posts, populating user details and sorting by most recent
    const posts = await Post.find()
      .populate("user", "username avatar") // Fetch user name and avatar for display
      .sort({ createdAt: -1 }) // Sort by most recent
      .select("-createdAt"); // Optionally hide createdAt field if not needed

    res.status(200).json({ posts });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch posts.",
      error: error.message,
    });
  }
};

// Add or update reactions to a post
export const updateReactions = async (req, res) => {
  try {
    const { postId, reactionType, remove } = req.body;

    // Validate input
    if (!postId || !reactionType) {
      return res.status(400).json({
        success: false,
        message: "Post ID and reaction type are required.",
      });
    }

    // Check if the post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    // Initialize reactions map if not present
    if (!post.reactions) {
      post.reactions = new Map();
    }

    // Initialize reaction type count if not present
    if (!post.reactions.has(reactionType)) {
      post.reactions.set(reactionType, 0);
    }

    if (remove) {
      // Decrease reaction count if the user wants to remove it
      const currentCount = post.reactions.get(reactionType);
      post.reactions.set(reactionType, Math.max(currentCount - 1, 0)); // Ensure count doesn't go below 0
    } else {
      // Increase reaction count when adding
      post.reactions.set(reactionType, post.reactions.get(reactionType) + 1);
    }

    // Save the post with the updated reactions
    await post.save();

    res.status(200).json({
      success: true,
      message: `Reaction '${reactionType}' ${remove ? "removed" : "added"} successfully.`,
      post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update reactions.",
      error: error.message,
    });
  }
};

