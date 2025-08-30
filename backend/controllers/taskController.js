// controllers/taskController.js

import Task from "../models/Task.js";
import TaskTemplate from "../models/TaskTemplate.js";
import Subtask from "../models/Subtask.js";
import SubtaskTemplate from "../models/SubtaskTemplate.js";
import Member from "../models/Member.js";
import mongoose from "mongoose";
import { assignSubtaskDependencies } from "./subtaskController.js";
import { sendNotification } from "../services/notificationService.js";
import { taskAssignmentAlert, taskCreationAlert,deadlineUpdateAlert } from "../services/alertService.js";
import dynamicCronService from "../services/cronService.js";
// import { resolveSubtaskDependenciesByName } from '../algorithms/cpm.js';

// Validation helper functions
const validateDeadline = (deadline) => {
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const twoYearsFromNow = new Date();
  twoYearsFromNow.setFullYear(now.getFullYear() + 2);

  if (deadlineDate < now) {
    return { isValid: false, message: "Deadline cannot be in the past" };
  }
  if (deadlineDate > twoYearsFromNow) {
    return {
      isValid: false,
      message: "Deadline cannot be more than 2 years from now",
    };
  }
  return { isValid: true };
};

const validateMemberRoles = async (subtasks, company) => {
  const errors = [];
  const warnings = [];

  for (let i = 0; i < subtasks.length; i++) {
    const sub = subtasks[i];
    if (sub.assignedMember && sub.role) {
      const member = await Member.findOne({
        _id: sub.assignedMember,
        company,
      }).populate("roles");

      if (!member) {
        errors.push(`Subtask ${i + 1}: Assigned member not found`);
        continue;
      }

      const hasRequiredRole = member.roles.some(
        (role) => role._id.toString() === sub.role.toString()
      );

      if (!hasRequiredRole) {
        errors.push(
          `Subtask ${i + 1}: Member ${
            member.name
          } does not have the required role`
        );
      }
    }
  }

  return { errors, warnings };
};

const validateTaskTemplate = async (templateId, company) => {
  if (!templateId) return { isValid: true };

  const template = await TaskTemplate.findOne({
    _id: templateId,
    company,
  });

  if (!template) {
    return {
      isValid: false,
      message: "Task template not found for this company",
    };
  }

  return { isValid: true, template };
};

const callCriticalPathValidation = async (
  subtasksData,
  startDate,
  deadline
) => {
  try {
    // Format subtasks for CPM validation
    const formattedSubtasks = subtasksData.map((st) => ({
      estimatedDurationDays: st.estimatedDurationDays || 1,
      dependencies: st.dependencies || [],
    }));

    // Create a temporary task object for validation
    const tempTask = {
      startDate: startDate || new Date(),
      deadline: new Date(deadline),
    };

    // Simulate the critical path calculation
    const { computeCPM } = await import("../algorithms/cpm.js");
    const { detectCircularDependency } = await import("../utils/graphUtils.js");

    // Check for circular dependencies
    if (detectCircularDependency(formattedSubtasks)) {
      return {
        isValid: false,
        message: "Circular dependency detected among subtasks",
      };
    }

    // Run CPM
    const cpmResult = computeCPM(formattedSubtasks);
    const criticalPathDuration = Math.max(...cpmResult.map((s) => s.EF));

    const now = tempTask.startDate;
    const deadlineDate = new Date(tempTask.deadline);
    const deadlineDuration = Math.ceil(
      (deadlineDate - now) / (1000 * 60 * 60 * 24)
    );

    if (criticalPathDuration > deadlineDuration) {
      return {
        isValid: false,
        isCritical: true,
        criticalPathDuration,
        availableDays: deadlineDuration,
        message: `Critical path duration (${criticalPathDuration} days) exceeds available time (${deadlineDuration} days). Please extend deadline or reduce task durations.`,
      };
    }

    return {
      isValid: true,
      criticalPathDuration,
      availableDays: deadlineDuration,
    };
  } catch (error) {
    console.error("Critical path validation error:", error);
    return {
      isValid: false,
      message: "Failed to validate critical path: " + error.message,
    };
  }
};

export const createTask = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { taskTemplate, name, deadline, priority, subtasks = [], startDate } = req.body;
    const company = req.user.company;

    // Debug logging
    console.log("Creating task with data:", {
      name,
      deadline,
      priority,
      startDate,
      subtasksCount: subtasks.length,
      subtasks: subtasks.map((sub, i) => ({
        index: i,
        subtaskTemplate: sub.subtaskTemplate,
        assignedMember: sub.assignedMember,
        estimatedDurationDays: sub.estimatedDurationDays,
      })),
    });

    // Validation array to collect all errors
    const validationErrors = [];
    const validationWarnings = [];

    // Basic validations
    if (!company) {
      return res.status(400).json({ message: "User has no company assigned" });
    }

    if (!name?.trim()) {
      validationErrors.push("Project name is required");
    }

    if (!deadline) {
      validationErrors.push("Deadline is required");
    }

    if (!subtasks || subtasks.length === 0) {
      validationErrors.push("Task must have at least one subtask.");
    }

    // Validate priority
    if (priority && !['urgent', 'high', 'moderate', 'low'].includes(priority)) {
      validationErrors.push("Priority must be one of: urgent, high, moderate, low");
    }

    // Validate deadline
    if (deadline) {
      const deadlineValidation = validateDeadline(deadline);
      if (!deadlineValidation.isValid) {
        validationErrors.push(deadlineValidation.message);
      }
    }

    // Validate task template if provided
    let templateData = null;
    if (taskTemplate) {
      const templateValidation = await validateTaskTemplate(
        taskTemplate,
        company
      );
      if (!templateValidation.isValid) {
        validationErrors.push(templateValidation.message);
      } else {
        templateData = templateValidation.template;
      }
    }

    // Only use raw subtasks from the request, ignore template subtasks
    let finalSubtasks = [];
    for (const sub of subtasks) {
      let memberDoc = null;
      if (sub.assignedMember) {
        try {
          memberDoc = await Member.findById(sub.assignedMember);
        } catch (e) {
          memberDoc = null;
        }
      }
      finalSubtasks.push({
        ...sub,
        assignedMember: memberDoc ? memberDoc._id : null
      });
    }

    console.log(
      "Final subtasks array:",
      finalSubtasks.map((sub, i) => ({
        index: i,
        assignedMember: sub.assignedMember,
        role: sub.role,
      }))
    );

    // Validate member assignments
    if (finalSubtasks.length > 0) {
      const memberValidation = await validateMemberRoles(
        finalSubtasks,
        company
      );
      validationErrors.push(...memberValidation.errors);
      validationWarnings.push(...memberValidation.warnings);
    }

    // Validate critical path if we have subtasks
    if (finalSubtasks.length > 0 && validationErrors.length === 0) {
      const criticalPathValidation = await callCriticalPathValidation(
        finalSubtasks,
        startDate,
        deadline
      );

      if (!criticalPathValidation.isValid) {
        if (criticalPathValidation.isCritical) {
          // This is a critical error that should prevent task creation
          validationErrors.push(criticalPathValidation.message);
        } else {
          validationWarnings.push(criticalPathValidation.message);
        }
      }
    }

    // Return validation errors if any critical issues found
    if (validationErrors.length > 0) {
      await session.abortTransaction();
      session.endSession();

      return res.status(400).json({
        message: "Validation failed",
        errors: validationErrors,
        warnings: validationWarnings,
      });
    }

    // Create the task
    const task = new Task({
      company,
      taskTemplate: taskTemplate || null,
      name: name.trim(),
      priority: priority || 'moderate',
      deadline,
      startDate: startDate || new Date(),
    });
    await task.save({ session });

  // Create subtasks
  const createdSubtasks = [];
  // const subtaskIndexToId = {}; // for dependency mapping
  const subtaskIndexToNewId = {}; // key: index in templateData.subtasks, value: new subtask._id

    for (let i = 0; i < finalSubtasks.length; i++) {
      const sub = finalSubtasks[i];
      let subtask;
      try {
        if (sub.subtaskTemplate) {
          const templateDoc = await SubtaskTemplate.findById(sub.subtaskTemplate);
          if (!templateDoc) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
              message: `Subtask template ${sub.subtaskTemplate} not found`,
            });
          }
          subtask = new Subtask({
            task: task._id,
            name: sub.name || templateDoc.name,
            subtaskTemplate: templateDoc._id,
            assignedMember: sub.assignedMember || null,
            estimatedDurationDays: sub.estimatedDurationDays || templateDoc.estimatedDurationDays,
            role: sub.role || templateDoc.role,
            description: sub.description || templateDoc.description,
          });
        } else {
          // Manual subtask (no template)
          subtask = new Subtask({
            task: task._id,
            name: sub.name,
            assignedMember: sub.assignedMember || null,
            estimatedDurationDays: sub.estimatedDurationDays || 1,
            role: sub.role,
            description: sub.description || '',
          });
        }
        await subtask.save({ session });
        createdSubtasks.push(subtask._id);
        subtaskIndexToNewId[i] = subtask._id;
      } catch (error) {
        console.error(`Subtask ${i} creation error:`, error);
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({
          message: `Failed to create subtask ${i + 1}`,
          error: error.message,
        });
      }
    }

  // ✅ Remap dependencies from indices → actual subtask IDs
  for (let i = 0; i < finalSubtasks.length; i++) {
    const sub = finalSubtasks[i];
    if (Array.isArray(sub.dependencies)) {
      sub.dependencies = sub.dependencies
        .map(depIndex => subtaskIndexToNewId[depIndex])
        .filter(Boolean); // remove undefined
    }
  }

  // Update subtasks in DB
  for (let i = 0; i < finalSubtasks.length; i++) {
    await Subtask.findByIdAndUpdate(subtaskIndexToNewId[i], {
      dependencies: finalSubtasks[i].dependencies,
    }, { session });
  }


    // Assign dependencies
    if (finalSubtasks.length > 0) {
      await assignSubtaskDependencies(subtaskIndexToNewId, finalSubtasks);
    }

    // Update task with subtasks
    task.subtasks = createdSubtasks;
    await task.save({ session });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    // Run CPM scheduling to calculate subtask deadlines and timing
    try {
      // Import and call the helper scheduling function
      const { runCPMForTask } = await import("./schedulingController.js");
      await runCPMForTask(task._id);
      console.log("hi from outside  1");
    } catch (error) {
      console.error("Warning: Failed to run CPM scheduling:", error.message);
      // Don't fail the entire task creation if scheduling fails
    }

      try {
        console.log("hi from inside");
        // Send assignment notifications using taskCreationAlert
        await taskCreationAlert(task);
      } catch (error) {
        console.error(
          "Warning: Failed to send task creation alerts:",
          error.message
        );
        // Don't fail the entire task creation if notifications fail
      }

      // Update cron service with new task deadlines
      try {
        await dynamicCronService.updateCronListForTask(task._id);
      } catch (error) {
        console.error("Warning: Failed to update cron service:", error.message);
      }


    // Return success response with warnings if any
    const response = {
      message: "Task created successfully",
      task: {
        _id: task._id,
        name: task.name,
        priority: task.priority,
        deadline: task.deadline,
        startDate: task.startDate,
      },
    };

    if (validationWarnings.length > 0) {
      response.warnings = validationWarnings;
    }

    res.status(201).json(response);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Task creation error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ company: req.user.company })
      .populate("taskTemplate")
      .populate({
        path: "subtasks",
        populate: [
          { path: "subtaskTemplate", select: "name" },
          { path: "assignedMember", select: "name" },
        ],
      });

    res.status(200).json(tasks);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOne({ _id: id, company: req.user.company })
      .populate("taskTemplate")
      .populate({
        path: "subtasks",
        populate: [
          { path: "subtaskTemplate", select: "name" },
          { path: "assignedMember", select: "name" },
        ],
      });

    if (!task) return res.status(404).json({ message: "Task not found" });

    res.status(200).json(task);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
// this will delete those subtasks which are nto sent hai, so just id bhayeni pathaunu parxa
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, deadline, priority, subtasks } = req.body;

    const task = await Task.findOne({ _id: id, company: req.user.company }).populate('subtasks');
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Validate priority if provided
    if (priority && !['urgent', 'high', 'moderate', 'low'].includes(priority)) {
      return res.status(400).json({ message: "Priority must be one of: urgent, high, moderate, low" });
    }

    let subtasksPresent = Array.isArray(subtasks) && subtasks.length > 0;

    // Update only task details if no subtasks provided
    if (!subtasksPresent) {
      if (name) task.name = name;
      if (deadline) task.deadline = deadline;
      if (priority) task.priority = priority;
      await task.save();
      return res.status(200).json(task);
    }

    // Map of existing subtasks by id
    const existingSubtasksMap = new Map();
    for (const sub of task.subtasks) {
      existingSubtasksMap.set(sub._id.toString(), sub);
    }

    const updatedSubtaskIds = [];
    const subtaskIndexToId = {};
    for (let i = 0; i < subtasks.length; i++) {
      const s = subtasks[i];
      let subtaskDoc;
      let isNew = false;
      let wasAssignedMember;
      let wasDeadline;

      // If only _id is present, keep subtask as is
      if (s._id && Object.keys(s).length === 1 && existingSubtasksMap.has(s._id)) {
        subtaskDoc = existingSubtasksMap.get(s._id);
        updatedSubtaskIds.push(subtaskDoc._id);
        subtaskIndexToId[i] = subtaskDoc._id;
        continue; // skip editing, just keep as is
      }

      if (s._id && existingSubtasksMap.has(s._id)) {
        // Update existing subtask
        subtaskDoc = existingSubtasksMap.get(s._id);
        wasAssignedMember = subtaskDoc.assignedMember?.toString();
        wasDeadline = task.deadline;

        if (s.name) subtaskDoc.name = s.name;
        if (s.role) subtaskDoc.role = s.role;
        if (s.description !== undefined) subtaskDoc.description = s.description;
        if (s.estimatedDurationDays) subtaskDoc.estimatedDurationDays = s.estimatedDurationDays;
        if (s.assignedMember) subtaskDoc.assignedMember = mongoose.Types.ObjectId(s.assignedMember);

        await subtaskDoc.save();
        updatedSubtaskIds.push(subtaskDoc._id);
        subtaskIndexToId[i] = subtaskDoc._id;

        // Notify reassignment
        if (s.assignedMember && s.assignedMember !== wasAssignedMember) {
          await taskAssignmentAlert(task, [s.assignedMember]);
        }
        // Notify deadline change
        if (deadline && deadline !== wasDeadline && subtaskDoc.assignedMember) {
          await deadlineUpdateAlert(task, [subtaskDoc.assignedMember]);
        }
      } else {
        // Create new subtask
        isNew = true;
        subtaskDoc = new Subtask({
          task: task._id,
          name: s.name,
          role: s.role,
          description: s.description || "",
          estimatedDurationDays: s.estimatedDurationDays || 1,
          assignedMember: s.assignedMember ? mongoose.Types.ObjectId(s.assignedMember) : null,
        });
        await subtaskDoc.save();
        updatedSubtaskIds.push(subtaskDoc._id);
        subtaskIndexToId[i] = subtaskDoc._id;
        // Notify new assignment
        if (subtaskDoc.assignedMember) {
          await taskAssignmentAlert(task, [subtaskDoc.assignedMember]);
        }
      }
    }

    // Delete old subtasks not present in the new list
    await Subtask.deleteMany({
      task: task._id,
      _id: { $nin: updatedSubtaskIds },
    });

    // Update task fields
    if (name) task.name = name;
    if (deadline) task.deadline = deadline;
    if (priority) task.priority = priority;
    task.subtasks = updatedSubtaskIds;
    await task.save();

    // Assign dependencies after all subtasks are saved
    await assignSubtaskDependencies(subtaskIndexToId, subtasks);

    // Run CPM scheduling
    try {
      const { runCPMForTask } = await import("./schedulingController.js");
      await runCPMForTask(task._id);
    } catch (error) {
      console.error("Warning: Failed to run CPM scheduling:", error.message);
    }

    // Update cron service after task update
    try {
      await dynamicCronService.updateCronListForTask(task._id);
    } catch (error) {
      console.error("Warning: Failed to update cron service:", error.message);
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOne({ _id: id, company: req.user.company });
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Delete all subtasks
    await Subtask.deleteMany({ task: task._id });

    // Remove from cron service
    try {
      dynamicCronService.removeCronEntriesForTask(task._id);
    } catch (error) {
      console.error("Warning: Failed to remove task from cron service:", error.message);
    }

    // Delete the task
    await task.deleteOne();

    res.status(200).json({ message: "Task and related subtasks deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// for cpm

// export const getCPMData = async (req, res) => {
//   try {
//     const result = await getTaskCPM(req.params.id);
//     res.status(200).json(result);
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to calculate CPM', error: err.message });
//   }
// };
