import mongoose from 'mongoose';

const ResourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  url: { type: String, required: true, unique: true },
  type: { type: String, enum: ['book', 'video', 'blog', 'podcast'], required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  watched: { type: Boolean, default: false },
  relevanceScore: { type: Number, default: 0 },
  related_interest: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Interest' }],  // ✅ Now includes goals
  related_issues: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Issue' }],
}, { timestamps: true });

export const Resource = mongoose.model('Resource', ResourceSchema);
