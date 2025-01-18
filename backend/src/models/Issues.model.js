import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema({
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }], // Reference to User model
  illnessType: { type: String, required: true },
  severity: { type: String, enum: ['Low', 'Moderate', 'High'], required: true },
  createdAt: { type: Date, default: Date.now },
});

const Issue = mongoose.model('Issue', issueSchema);

export default Issue;