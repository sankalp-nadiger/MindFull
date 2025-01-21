//import Notification from '../models/notification.model.js';
import asyncHandler from '../utils/asynchandler.utils.js';
import {ApiError} from '../utils/API_Error.js';

// Create a Notification
const createNotification = asyncHandler(async (req, res) => {
    const { message, user, relatedInterest, event } = req.body;

    if (!message || !user) {
        throw new ApiError(400, 'Message and user are required');
    }

    const notification = await createAndPushNotification({
        message,
        user,
        relatedInterest,
        event,},
        req.app.get('socketio')
    );
    res.status(201).json({ message: 'Notification created successfully', notification });
});

// Get Notifications
const getNotifications = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const notifications = await Notification.find({ user: userId })
        .populate('relatedInterest event')
        .sort({ createdAt: -1 });

    res.status(200).json(notifications);
});

// Delete Notification
const deleteNotification = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndDelete(notificationId);
    if (!notification) {
        throw new ApiError(404, 'Notification not found');
    }

    res.status(200).json({ message: 'Notification deleted successfully' });
});


export { createNotification, getNotifications, deleteNotification };