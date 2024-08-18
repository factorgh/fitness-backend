// controllers/notificationController.js
import Notification from "../models/notifications.js";

import { Socket } from "socket.io";

// Get notifications for a user
const getNotifications = async (req, res) => {
  const { userId } = req.params;
  try {
    const notifications = await Notification.find({ userId }).sort({
      createdAt: -1,
    });
    res.status(200).json(notifications);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching notifications", error: err });
  }
};

// Create a new notification
const createNotification = async (req, res) => {
  const { userId, message, type } = req.body;
  try {
    const notification = new Notification({ userId, message, type });
    await notification.save();

    // Emit the notification to the user's socket
    Socket.io.emit(`notification-${userId}`, notification);

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

//  Get all notifications for a user in descending order of creation date

export default {
  markAsRead,
  createNotification,
  getNotifications,
};
