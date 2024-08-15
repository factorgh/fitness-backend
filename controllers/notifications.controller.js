// controllers/notificationController.js
import Notification from "../models/notifications.js";

// Get notifications for a user
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.params.userId,
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new notification
const createNotification = async (req, res) => {
  const { userId, message, type } = req.body;
  try {
    const notification = new Notification({ userId, message, type });
    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Mark a notification as read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification)
      return res.status(404).json({ message: "Notification not found" });

    notification.isRead = true;
    await notification.save();
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export default {
  markAsRead,
  createNotification,
  getNotifications,
};
