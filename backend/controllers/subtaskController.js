// controllers/subtaskController.js

import Subtask from '../models/Subtask.js';
import Task from '../models/Task.js';
import { taskStatusAlert, sendAlert } from '../services/alertService.js';
import User from '../models/User.js';
import dynamicCronService from '../services/cronService.js';

export const getSubtaskById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Fetching subtask by ID: ${id}`);

    const subtask = await Subtask.findById(id)
      .populate('subtaskTemplate', 'name estimatedDurationDays')
      .populate('assignedMember', 'name email')
      .populate('task', 'name deadline company')
      .populate({
        path: 'dependencies',
        select: 'subtaskTemplate name status'
      });

    if (!subtask) {
      console.log(`❌ Subtask not found: ${id}`);
      return res.status(404).json({ message: 'Subtask not found' });
    }

    console.log(`✅ Found subtask: ${subtask.name} (assigned to: ${subtask.assignedMember?.name || 'none'})`);

    // Check if user has access to this subtask
    if (req.user.role === 'employee') {
      // Employees can only access subtasks assigned to them or in their company
      const isAssigned = subtask.assignedMember && subtask.assignedMember._id.toString() === req.user.member.toString();
      const sameCompany = subtask.task.company.toString() === req.user.company.toString();
      
      if (!isAssigned && !sameCompany) {
        console.log(`❌ Access denied for employee: not assigned and different company`);
        return res.status(403).json({ message: 'Access denied' });
      }
    } else {
      // Managers and superadmins need to be in the same company
      if (subtask.task.company.toString() !== req.user.company.toString()) {
        console.log(`❌ Access denied: different company`);
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    console.log(`✅ Access granted for user: ${req.user.email} (${req.user.role})`);
    res.status(200).json(subtask);
  } catch (error) {
    console.error('Error fetching subtask:', error);
    res.status(500).json({ message: 'Failed to fetch subtask', error: error.message });
  }
};


export const getSubtasksByTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const subtasks = await Subtask.find({ task: taskId })
      .populate("subtaskTemplate", "name estimatedDurationDays")
      .populate("assignedMember", "name email")
      .populate({
        path: "dependencies",
        select: "subtaskTemplate name",
      });
    res.status(200).json(subtasks);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch subtasks", error: error.message });
  }
};

// changes status and other fields including attachments
export const updateSubtask = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment, assignedMember, attachments } = req.body;
    console.log("Updating subtask with:", { status, comment, assignedMember, attachments });
    
    const subtask = await Subtask.findById(id).populate('dependencies');
    if (!subtask) return res.status(404).json({ message: 'Subtask not found' });

    // 🚨 Prevent status change to "In Progress" unless dependencies are completed
    if (
      status &&
      status === "In Progress" &&
      subtask.status === "Not Started" && // only check if moving from Not Started
      subtask.dependencies.length > 0
    ) {
      const incompleteDeps = subtask.dependencies.filter(
        (dep) => dep.status !== "Completed"
      );
      if (incompleteDeps.length > 0) {
        console.log(
          "Cannot start subtask, dependencies incomplete:",
          incompleteDeps
        );
        // send alert
        await sendAlert({
          recipients: [req.user._id],
          message:
            "Cannot start this subtask until all dependencies are completed",
          type: "error",
          redirectTo: `/subtasks/${subtask._id}`,
          persist: true,
        });
        return res.status(400).json({
          message:
            "Cannot start this subtask until all dependencies are completed",
          incompleteDependencies: incompleteDeps.map((dep) => ({
            id: dep._id,
            name: dep.name,
            status: dep.status,
          })),
        });
      }
    }

    // 🚨 Prevent status change to "Completed" unless dependencies are completed
    if (
      status &&
      status === 'Completed' &&
      subtask.dependencies.length > 0
    ) {
      const incompleteDeps = subtask.dependencies.filter(dep => dep.status !== 'Completed');
      if (incompleteDeps.length > 0) {
        console.log("Cannot complete subtask, dependencies incomplete:", incompleteDeps);
        // send alert
        await sendAlert({
          recipients: [req.user._id],
          message: 'Cannot complete this subtask until all dependencies are completed',
          type: "warning",
          redirectTo: `/subtasks/${subtask._id}`,
          persist: false
        });
        return res.status(400).json({
          message: 'Cannot complete this subtask until all dependencies are completed',
          incompleteDependencies: incompleteDeps.map(dep => ({
            id: dep._id,
            name: dep.name,
            status: dep.status
          }))
        });
      }
    }

    // Update subtask fields
    if (status) {
      if (status === "In Progress" && !subtask.startedAt) {
        subtask.startedAt = new Date();
      }
      if (status === "Completed" && !subtask.completedAt) {
        subtask.completedAt = new Date();
      }
      subtask.status = status;
      console.log("Status updated to:", status);
    }

    if (comment !== undefined) {
      subtask.comment = comment;
      console.log("Comment updated to:", comment);
    }
    
    if (assignedMember !== undefined) {
      subtask.assignedMember = assignedMember;
      console.log("Assigned member updated to:", assignedMember);
    }
    
    // Handle attachments - validate format and update
    if (attachments !== undefined) {
      if (Array.isArray(attachments)) {
        // Validate each attachment
        const validAttachments = [];
        for (const attachment of attachments) {
          if (attachment.url && attachment.type && ['photo', 'pdf', 'link'].includes(attachment.type)) {
            validAttachments.push({
              url: attachment.url,
              type: attachment.type
            });
          } else {
            console.warn("Invalid attachment format:", attachment);
          }
        }
        subtask.attachments = validAttachments;
        console.log("Attachments updated:", validAttachments.length, "valid attachments");
      } else {
        console.warn("Attachments should be an array, received:", typeof attachments);
        return res.status(400).json({ 
          message: 'Attachments must be an array of objects with url and type properties' 
        });
      }
    }

    await subtask.save();

    // Update cron service when subtask status changes (especially when completed)
    try {
      await dynamicCronService.updateCronListForTask(subtask.task);
    } catch (error) {
      console.error("Warning: Failed to update cron service for subtask update:", error.message);
    }

    // 🔄 Update parent Task status based on subtasks
    const task = await Task.findById(subtask.task).populate("subtasks"); // assumes Task has subtasks array
    if (task) {
      const allCompleted = task.subtasks.every(
        (st) => st.status === "Completed"
      );
      const anyInProgress = task.subtasks.some(
        (st) => st.status === "In Progress"
      );

      // Notify all users with role 'manager' if all subtasks are completed and task is now completed
      if (allCompleted && task.status !== "Completed") {
        const managerUsers = await User.find({ role: "manager" });
        const managerIds = managerUsers.map((u) => u._id);
        await sendAlert({
          recipients: managerIds,
          message: `Task "${task.name}" is now completed. All subtasks are finished!`,
          type: "info",
          redirectTo: `/projects/${task._id}`,
          persist: true,
        });
        task.status = "Completed";
      } else if (anyInProgress && task.status === "Not Started") {
        task.status = "In Progress";
      }

      await task.save();
    }

    // Notify assigned member(s) if their subtask is unlocked (all dependencies completed)
    // Only trigger if this subtask was just completed
    if (status === "Completed") {
      // Find subtasks that depend on this subtask
      const dependentSubtasks = await Subtask.find({
        dependencies: subtask._id,
      });
      for (const depSubtask of dependentSubtasks) {
        // Check if all dependencies of depSubtask are completed
        const depSubtaskPop = await Subtask.findById(depSubtask._id).populate(
          "dependencies"
        );
        const allDepsCompleted = depSubtaskPop.dependencies.every(
          (dep) => dep.status === "Completed"
        );
        if (
          allDepsCompleted &&
          depSubtaskPop.status === "Not Started" &&
          depSubtaskPop.assignedMember
        ) {
          // Find user for assignedMember
          const user = await User.findOne({
            member: depSubtaskPop.assignedMember,
          });
          if (user) {
            await sendAlert({
              recipients: [user._id],
              message: `Your subtask "${depSubtaskPop.name}" is now unlocked! All dependencies are completed. You may start working on it now.`,
              type: "info",
              redirectTo: `/subtasks/${depSubtaskPop._id}`,
              persist: true,
            });
          }
        }
      }
    }

    res.status(200).json(subtask);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update subtask", error: error.message });
  }
};

export const deleteSubtask = async (req, res) => {
  try {
    const { id } = req.params;

    const subtask = await Subtask.findById(id);
    if (!subtask) return res.status(404).json({ message: "Subtask not found" });

    await subtask.deleteOne();
    res.status(200).json({ message: "Subtask deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete subtask", error: error.message });
  }
};

//subtask dependency resolver

export const assignSubtaskDependencies = async (subtaskMap, rawSubtasks) => {
  console.log("assignSubtaskDependencies called with:", {
    subtaskMap,
    rawSubtasks: rawSubtasks.map((s, i) => ({
      index: i,
      _id: s._id,
      dependencies: s.dependencies,
    })),
  });

  for (let i = 0; i < rawSubtasks.length; i++) {
    const { dependencies = [] } = rawSubtasks[i];
    const subtaskId = subtaskMap[i];

    console.log(`Processing subtask ${i}:`, {
      subtaskId,
      dependencies,
      dependenciesType: typeof dependencies[0],
      dependenciesLength: dependencies.length,
    });

    if (!subtaskId) {
      console.log(`Skipping subtask ${i} - no subtaskId`);
      continue;
    }

    let resolvedDeps;

    // Check if dependencies are already ObjectIds (edit case) or indices (create case)
    if (
      dependencies.length > 0 &&
      typeof dependencies[0] === "string" &&
      dependencies[0].length === 24
    ) {
      // Dependencies are already ObjectIds (from edit form)
      resolvedDeps = dependencies;
      console.log(`Subtask ${i}: Dependencies already as IDs:`, resolvedDeps);
    } else {
      // Dependencies are indices (from create form)
      resolvedDeps = dependencies
        .map((depIndex) => subtaskMap[depIndex])
        .filter(Boolean); // remove undefined
      console.log(
        `Subtask ${i}: Resolved dependencies from indices:`,
        resolvedDeps
      );
    }

    console.log(
      `Updating subtask ${subtaskId} with dependencies:`,
      resolvedDeps
    );
    await Subtask.findByIdAndUpdate(subtaskId, { dependencies: resolvedDeps });
  }

  console.log("assignSubtaskDependencies completed");
};
