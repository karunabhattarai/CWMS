// routes/employeeRoutes.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";
import {
  getEmployeeDashboard,
  getEmployeeSubtasks,
  getEmployeeProjects,
} from "../controllers/employeeController.js";

const router = express.Router();

// Employee dashboard data
router.get(
  "/dashboard",
  authMiddleware,
  allowRoles("employee"),
  getEmployeeDashboard
);

// Get all subtasks assigned to employee
router.get(
  "/subtasks",
  authMiddleware,
  allowRoles("employee"),
  getEmployeeSubtasks
);

// Get projects assigned to employee
router.get(
  "/projects",
  authMiddleware,
  allowRoles("employee"),
  getEmployeeProjects
);

// // Update employee's subtask
// router.put(
//   "/subtask/:id",
//   authMiddleware,
//   allowRoles("employee"),
//   updateEmployeeSubtask
// );

export default router;
