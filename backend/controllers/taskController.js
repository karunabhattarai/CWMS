// controllers/taskController.js

import Task from "../models/Task.js";
import TaskTemplate from "../models/TaskTemplate.js";
import Subtask from "../models/Subtask.js";
import SubtaskTemplate from "../models/SubtaskTemplate.js";
import Member from "../models/Member.js";
import mongoose from "mongoose";
import { assignSubtaskDependencies } from "./subtaskController.js";

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
  }).populate("subtasks.subtaskTemplate");

  if (!template) {
    return {
      isValid: false,
      message: "Task template not found for this company",
    };
  }

  // Validate all subtask templates still exist
  for (const sub of template.subtasks) {
    const subtaskTemplate = await SubtaskTemplate.findById(sub.subtaskTemplate);
    if (!subtaskTemplate) {
      return {
        isValid: false,
        message: `Subtask template ${sub.subtaskTemplate} not found`,
      };
    }
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
    const { taskTemplate, name, deadline, subtasks = [], startDate } = req.body;
    const company = req.user.company;

    // Debug logging
    console.log("Creating task with data:", {
      name,
      deadline,
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

    // If using template, prepare subtasks data from template
    let finalSubtasks = [];
    if (templateData) {
      // FIXED: Map frontend subtasks by subtaskTemplate ID for easy lookup
      const frontendSubtaskMap = new Map();
      subtasks.forEach((sub) => {
        if (sub.subtaskTemplate) {
          // Store both the original and string version as keys to handle any mismatch
          frontendSubtaskMap.set(sub.subtaskTemplate, sub);
          frontendSubtaskMap.set(sub.subtaskTemplate.toString(), sub);
        }
      });

      console.log(
        "Frontend subtask map keys:",
        Array.from(frontendSubtaskMap.keys())
      );

      // Build final subtasks from template with frontend overrides
      for (let i = 0; i < templateData.subtasks.length; i++) {
        const templateSub = templateData.subtasks[i];
        const subtaskTemplate = await SubtaskTemplate.findById(
          templateSub.subtaskTemplate
        );

        if (!subtaskTemplate) {
          validationErrors.push(
            `Subtask template ${templateSub.subtaskTemplate} not found`
          );
          continue;
        }

        // FIXED: Use the subtaskTemplate._id (from the fetched document) to match the frontend
        const templateId = subtaskTemplate._id.toString();
        let frontendOverride = frontendSubtaskMap.get(templateId);

        console.log(`Template ${i} - Looking for key: ${templateId}:`, {
          availableKeys: Array.from(frontendSubtaskMap.keys()),
          frontendOverride: frontendOverride
            ? {
                assignedMember: frontendOverride.assignedMember,
                estimatedDurationDays: frontendOverride.estimatedDurationDays,
              }
            : null,
        });

        // FIXED: Better assignedMember assignment logic
        let assignedMember = null;
        if (frontendOverride?.assignedMember) {
          const memberValue = frontendOverride.assignedMember.toString().trim();
          if (
            memberValue &&
            memberValue !== "" &&
            memberValue !== "null" &&
            memberValue !== "undefined"
          ) {
            assignedMember = memberValue;
          }
        }

        console.log(`Final assignedMember for subtask ${i}:`, assignedMember);

        finalSubtasks.push({
          subtaskTemplate: subtaskTemplate._id,
          role: subtaskTemplate.role,
          estimatedDurationDays:
            frontendOverride?.estimatedDurationDays ||
            subtaskTemplate.estimatedDurationDays,
          assignedMember: assignedMember,
          dependencies: templateSub.dependencies || [],
        });
      }
    } else {
      finalSubtasks = subtasks;
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
      deadline,
      startDate: startDate || new Date(),
    });
    await task.save({ session });

    // Create subtasks
    const createdSubtasks = [];
    const subtaskIndexToId = {}; // for dependency mapping

    for (let i = 0; i < finalSubtasks.length; i++) {
      const sub = finalSubtasks[i];
      let subtask;

      try {
        if (sub.subtaskTemplate) {
          // From template
          const templateDoc = await SubtaskTemplate.findById(
            sub.subtaskTemplate
          );
          if (!templateDoc) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
              message: `Subtask template ${sub.subtaskTemplate} not found`,
            });
          }

          // FIXED: Use the assignedMember from finalSubtasks directly
          const assignedMember = sub.assignedMember || null;

          subtask = new Subtask({
            task: task._id,
            name: templateDoc.name,
            subtaskTemplate: templateDoc._id,
            assignedMember: assignedMember,
            estimatedDurationDays:
              sub.estimatedDurationDays || templateDoc.estimatedDurationDays,
          });

          console.log(`Creating subtask ${i}:`, {
            name: templateDoc.name,
            assignedMemberFromFinal: sub.assignedMember,
            assignedMemberSet: assignedMember,
          });
        } else if (sub.name && sub.role && sub.estimatedDurationDays) {
          // Manual subtask
          const assignedMember = sub.assignedMember || null;

          subtask = new Subtask({
            task: task._id,
            name: sub.name,
            role: sub.role,
            description: sub.description || "",
            estimatedDurationDays: sub.estimatedDurationDays,
            assignedMember: assignedMember,
            status: sub.status || "Not Started",
          });

          console.log(`Creating manual subtask ${i}:`, {
            name: sub.name,
            assignedMemberFromSub: sub.assignedMember,
            assignedMemberSet: assignedMember,
          });
        } else {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            message: `Subtask ${
              i + 1
            }: Must have either "subtaskTemplate" OR all of "role", "name", "estimatedDurationDays"`,
          });
        }

        await subtask.save({ session });
        createdSubtasks.push(subtask._id);
        subtaskIndexToId[i] = subtask._id;
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

    // Assign dependencies
    if (finalSubtasks.length > 0) {
      await assignSubtaskDependencies(subtaskIndexToId, finalSubtasks);
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
    } catch (error) {
      console.error("Warning: Failed to run CPM scheduling:", error.message);
      // Don't fail the entire task creation if scheduling fails
    }

    // Return success response with warnings if any
    const response = {
      message: "Task created successfully",
      task: {
        _id: task._id,
        name: task.name,
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

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, deadline, subtasks = [] } = req.body;

    const task = await Task.findOne({ _id: id, company: req.user.company });
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Update basic fields
    task.name = name || task.name;
    task.deadline = deadline || task.deadline;

    const newSubtaskIds = [];
    const subtaskIndexToId = {};

    for (let i = 0; i < subtasks.length; i++) {
      const s = subtasks[i];
      let newSubtask;

      if (s.subtaskTemplate) {
        newSubtask = new Subtask({
          task: task._id,
          subtaskTemplate: s.subtaskTemplate,
        });
      } else if (s.role && s.name && s.estimatedDurationDays) {
        newSubtask = new Subtask({
          task: task._id,
          name: s.name,
          role: s.role,
          description: s.description || "",
          estimatedDurationDays: s.estimatedDurationDays,
        });
      } else {
        return res.status(400).json({
          message:
            'Each subtask must have either "subtaskTemplate" OR all of "role", "name", "estimatedDurationDays"',
        });
      }

      await newSubtask.save();
      newSubtaskIds.push(newSubtask._id);
      subtaskIndexToId[i] = newSubtask._id;
    }

    // Delete old subtasks (not in new list)
    await Subtask.deleteMany({
      task: task._id,
      _id: { $nin: newSubtaskIds },
    });

    task.subtasks = newSubtaskIds;
    await task.save();

    // Assign dependencies after all subtasks are saved
    await assignSubtaskDependencies(subtaskIndexToId, subtasks);

    res.status(200).json(task);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOne({ _id: id, company: req.user.company });
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Delete all subtasks
    await Subtask.deleteMany({ task: task._id });

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
