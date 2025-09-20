import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  counselor: { type: mongoose.Schema.Types.ObjectId, ref: 'Counselor', required: true },
  title: String,
  message: String,
  type: String, // 'session_request', 'appointment', 'feedback', etc.
  unread: { type: Boolean, default: true },
  accepted: { type: Boolean, default: false },
  rejected: { type: Boolean, default: false },
  relatedId: { type: mongoose.Schema.Types.ObjectId, refPath: 'type' }, // optional
  createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model('Notification', NotificationSchema);
export default Notification;