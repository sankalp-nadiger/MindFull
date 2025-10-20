import Notification from '../models/notification.model.js';

export const createAndPushNotification = async (data, io) => {
  const { message, user, relatedInterest, event } = data;

  if (!message || !user) {
    throw new Error('Message and user are required to create a notification');
  }

  // Create notification in the database
  const notification = new Notification({
    message,
    user,
    relatedInterest,
    event,
    type: event
  });

  await notification.save();

  // Emit notification to the specific user (via Socket.io)
  io.to(user.toString()).emit('notification', {
    id: notification._id,
    message: notification.message,
    relatedInterest,
    event,
    createdAt: notification.createdAt,
  });

  return notification;
};
