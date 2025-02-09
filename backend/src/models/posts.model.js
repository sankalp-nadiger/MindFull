import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    // title: {
    //   type: String,
    //   required: true,
    //   trim: true,
    //   maxlength: 100,
    // },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    author: String,
    reactions: {
      type: Map, // Using a Map for different reaction types
      of: Number, // Number of reactions for each type (e.g., "like": 10, "support": 5)
      default: new Map(),
    },
    isAnonymous: {
      type: Boolean, // Indicates if the post is made anonymously
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 24 * 60 * 60, // Automatically delete the story after 24 hours
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

export const Post = mongoose.model('Post', postSchema);