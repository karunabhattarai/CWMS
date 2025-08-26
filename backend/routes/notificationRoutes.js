import express from "express";
import {
  createNotification,
  getUserNotifications,
  markAsRead,
  deleteNotification,
} from "../controllers/notificationController.js";
import authMiddleware from '../middleware/authMiddleware.js';
import allowRoles from '../middleware/roleMiddleware.js';

const router = express.Router();

// Create a new notification (usually called by backend/services, not frontend manually)
router.post("/", authMiddleware,allowRoles('superadmin','manager'),createNotification);

// Get all notifications for a user
router.get("/user/:userId", authMiddleware,getUserNotifications);

// Mark a notification as read
router.patch("/:notificationId/read",authMiddleware, markAsRead);

// Delete a notification (admin/system)
router.delete("/:notificationId",authMiddleware,allowRoles('superadmin','manager'), deleteNotification);

export default router;
