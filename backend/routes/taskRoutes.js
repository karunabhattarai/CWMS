// routes/taskRoutes.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";
import {
  scheduleTaskPERT,
  schedulePERTFromRaw,
} from "../controllers/schedulingController.js";
import { computePDM } from "../algorithms/pdm.js";
import {
  createTask,
  getAllTasks,
  updateTask,
  deleteTask,
  getTaskById,
  // getCPMData
} from "../controllers/taskController.js";

const router = express.Router();

// for pert
router.get("/schedule-pert/:taskId", scheduleTaskPERT);
router.post("/schedule-pert", schedulePERTFromRaw);

//pdm
router.post("/schedule-pdm/:taskId", computePDM);
router.post("/schedule-pdm", computePDM);

// for task
router.post(
  "/",
  authMiddleware,
  allowRoles("superadmin", "manager"),
  createTask
);

router.get(
  "/",
  authMiddleware,
  allowRoles("superadmin", "manager"),
  getAllTasks
);

router.put(
  "/:id",
  authMiddleware,
  allowRoles("superadmin", "manager"),
  updateTask
);

router.delete(
  "/:id",
  authMiddleware,
  allowRoles("superadmin", "manager"),
  deleteTask
);
router.get(
  "/:id",
  authMiddleware,
  allowRoles("superadmin", "manager", "employee"),
  getTaskById
);

// router.get('/task/:id/cpm', getCPMData); // GET /task/:id/cpm

export default router;
