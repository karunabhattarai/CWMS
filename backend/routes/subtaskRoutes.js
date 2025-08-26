// routes/subtaskRoutes.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";
import {
  getSubtasksByTask,
  updateSubtask,
  deleteSubtask,
} from "../controllers/subtaskController.js";

const router = express.Router();

router.get(
  "/task/:taskId",
  authMiddleware,
  allowRoles("superadmin", "manager"),
  getSubtasksByTask
);

router.put(
  "/:id",
  authMiddleware,
  allowRoles("superadmin", "manager", "employee"),
  updateSubtask
);

router.delete(
  "/:id",
  authMiddleware,
  allowRoles("superadmin", "manager"),
  deleteSubtask
);

export default router;
