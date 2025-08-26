// routes/alertRoutes.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";
import { sendAlertController } from "../controllers/alertController.js";

const router = express.Router();

// Send an alert manually | not what we do, just for testing
router.post(
  "/send",
  authMiddleware,
  allowRoles("superadmin", "manager"),
  sendAlertController
);

export default router;
