import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  counselor: { type: mongoose.Schema.Types.ObjectId, ref: 'Counselor', required: true },
  title: String,
  message: String,
  type: String, // 'session_request', 'appointment', 'feedback', 'sitting_recommendation'
  unread: { type: Boolean, default: true },
  accepted: { type: Boolean, default: false },
  rejected: { type: Boolean, default: false },
  relatedId: { type: mongoose.Schema.Types.ObjectId }, // can be sessionId, or null
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  meta: { type: Object }, // for extra info (diagnosis, count)
  createdAt: { type: Date, default: Date.now }
});


const Notification = mongoose.model('Notification', NotificationSchema);
export default Notification;