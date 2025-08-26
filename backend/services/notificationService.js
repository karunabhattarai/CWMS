// services/notificationService.js
import Notification from "../models/Notification.js";
import { getIO } from "../utils/websocket.js";

/**
 * Create a notification and optionally push via WebSocket
 * @param {Object} params
 * @param {Array} params.recipients - array of user IDs
 * @param {String} params.message - notification message
 * @param {String} [params.redirectTo] - route to redirect on click
 * @param {String} [params.type] - "info" | "warning" | "critical" | "role" | "deadline" | "system"
 */
export const sendNotification = async ({ recipients, message, redirectTo = null, type = "info" }) => {
  if (!recipients || recipients.length === 0) {
    throw new Error("Recipients required");
  }

  // Create notification in DB
  const notification = new Notification({
    recipients,
    message,
    redirectTo,
    type
  });

  await notification.save();

  // Emit to each user via WebSocket (room per user)
  const io = getIO();
  recipients.forEach(userId => {
    io.to(userId.toString()).emit("newNotification", notification);
  });

  return notification;
};

/**
 * Mark a notification as read by a user
 */
export const markNotificationAsRead = async (notificationId, userId) => {
  if (!userId) throw new Error("User ID required");

  const updated = await Notification.findByIdAndUpdate(
    notificationId,
    { $addToSet: { readBy: userId } }, // prevents duplicates
    { new: true }
  );

  if (!updated) throw new Error("Notification not found");

  return updated;
};

/**
 * Get all notifications for a user
 */
export const getUserNotifications = async (userId) => {
  if (!userId) throw new Error("User ID required");

  return await Notification.find({ recipients: userId })
    .sort({ createdAt: -1 })
    .lean();
};

/**
 * Delete a notification (optional, for admin or cleanup)
 */
export const deleteNotification = async (notificationId) => {
  await Notification.findByIdAndDelete(notificationId);
};
