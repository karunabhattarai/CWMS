import express from "express";
import {
  registerSuperAdmin,
  loginUser,
  getAllUsers,
  registerManager,
} from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/register", registerSuperAdmin);
router.post("/login", loginUser);
router.get("/all", authMiddleware, getAllUsers);

router.post(
  "/createManager",
  authMiddleware,
  // allowRoles('superadmin'), // Only allow superadmin
  allowRoles("superadmin", "manager"), // Allow superadmin and manager
  registerManager
);

export default router;
