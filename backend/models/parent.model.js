import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// Parent Schema
const parentSchema = new Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: String,
    required: true,
    unique: true,
  },
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Reference to the Student model
  },
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

// Export Parent Model
export const Parent = mongoose.model('Parent', parentSchema);
