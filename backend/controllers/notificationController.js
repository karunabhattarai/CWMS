import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { getIO } from "../utils/websocket.js";
/**
 * Create a new notification
 */
export const createNotification = async (req, res) => {
  try {
    const { recipients, message, redirectTo, type } = req.body;

    if (!recipients || recipients.length === 0) {
      return res.status(400).json({ success: false, error: "Recipients required" });
    }

    const notification = new Notification({
      recipients,
      message,
      redirectTo: redirectTo || null,
      type: type || "info",
    });

    await notification.save();
    const io = getIO();
    recipients.forEach(userId => {
      io.to(userId).emit("newNotification", notification);
    });
    res.status(201).json({ success: true, data: notification });
  } catch (err) {
    console.error("Error creating notification:", err);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

/**
 * Get all notifications for a user
 */
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.params.userId;

    const notifications = await Notification.find({
      recipients: userId,
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: notifications });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ success: false, error: "Server Error" });
  }
}; // is this checking for security? hernu parne xa

/**
 * Mark a notification as read for a user
 */
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user?._id // always from auth, never from req.body

    if (!userId) {
      return res.status(400).json({ success: false, error: "User ID required" });
    }

    const updated = await Notification.findByIdAndUpdate(
      notificationId,
      { $addToSet: { readBy: userId } }, // prevents duplicates
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, error: "Notification not found" });
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("Error marking notification as read:", err);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

/**
 * Delete a notification (system cleanup, or superadmin feature)
 */
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    await Notification.findByIdAndDelete(notificationId);

    res.json({ success: true, message: "Notification deleted" });
  } catch (err) {
    console.error("Error deleting notification:", err);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};
