const Post = require('../models/Post');
const User = require('../models/User'); // Assuming a User schema exists

// Create a new post
const createPost = async (req, res) => {
  try {
    const { title, content, isAnonymous } = req.body;

    // Fetch the current user's tags/preferences
    const user = await User.findById(req.user.id); // req.user is populated by auth middleware
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const newPost = new Post({
      title,
      content,
      tags: user.tags || [], // Use user's tags or an empty array
      isAnonymous,
      author: req.user.id, // Logged-in user
    });

    const savedPost = await newPost.save();

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: savedPost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating post',
      error: error.message,
    });
  }
};

export { createPost }