import {User} from "../models/user.model.js"

  try {
    const { userId, title, content, isAnonymous } = req.body;

    // Ensure all required fields are present
    if (!userId || !title || !content) {
      return res.status(400).json({
        success: false,
        message: "User ID, title, and content are required.",
      });
    }

    // Fetch the user's tags/preferences
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Create a new post
    const newPost = new Post({
      title,
      content,
      tags: user.tags || [], // Use user's tags or an empty array
      isAnonymous,
      author: userId, // Use user ID directly
    });

    const savedPost = await newPost.save();

    res.status(201).json({
      success: true,
      message: "Post created successfully.",
      post: savedPost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating post.",
      error: error.message,
    });
  }

export { createPost };
