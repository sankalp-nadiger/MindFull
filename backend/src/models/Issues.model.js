import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema({
  user: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }], // Reference to User model
  illnessType: { type: String },
  severity: { type: String, enum: ['Low', 'Moderate', 'High'] },
  createdAt: { type: Date, default: Date.now },
});

export const Issue = mongoose.model('Issue', issueSchema);
