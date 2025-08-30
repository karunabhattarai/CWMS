// controllers/subtaskController.js

import Subtask from '../models/Subtask.js';
import Task from '../models/Task.js';
import { taskStatusAlert, sendAlert } from '../services/alertService.js';
import User from '../models/User.js';


export const getSubtasksByTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const subtasks = await Subtask.find({ task: taskId })
      .populate('subtaskTemplate', 'name estimatedDurationDays')
      .populate('assignedMember', 'name email')
      .populate({
        path: 'dependencies',
        select: 'subtaskTemplate name'
      });
    res.status(200).json(subtasks);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch subtasks', error: error.message });
  }
};

// changes status only
export const updateSubtask = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment, assignedMember, attachments } = req.body;
    console.log(status);
    const subtask = await Subtask.findById(id).populate('dependencies');
    if (!subtask) return res.status(404).json({ message: 'Subtask not found' });

    // 🚨 Prevent status change to "In Progress" unless dependencies are completed
    if (
      status &&
      status === 'In Progress' &&
      subtask.status === 'Not Started' && // only check if moving from Not Started
      subtask.dependencies.length > 0
    ) {
      const incompleteDeps = subtask.dependencies.filter(dep => dep.status !== 'Completed');
      if (incompleteDeps.length > 0) {
        console.log("Cannot start subtask, dependencies incomplete:", incompleteDeps);
        // send alert
        await sendAlert({
          recipients: [req.user._id],
          message: 'Cannot start this subtask until all dependencies are completed',
          type: "error",
          redirectTo: `/subtasks/${subtask._id}`,
          persist: true
        });
        return res.status(400).json({
          message: 'Cannot start this subtask until all dependencies are completed',
          incompleteDependencies: incompleteDeps.map(dep => ({
            id: dep._id,
            name: dep.name,
            status: dep.status
          }))
        });
      }
    }
    //update subtask fields
    if (status) {
      if (status === 'In Progress' && !subtask.startedAt) {
        subtask.startedAt = new Date();
      }
      if (status === 'Completed' && !subtask.completedAt) {
        subtask.completedAt = new Date();
      }
      subtask.status = status;
      console.log("Status updated to:", status);
    }

    if (comment !== undefined) subtask.comment = comment;
    if (assignedMember !== undefined) subtask.assignedMember = assignedMember;
    if (attachments !== undefined) subtask.attachments = attachments;

    await subtask.save();

    // 🔄 Update parent Task status based on subtasks
    const task = await Task.findById(subtask.task).populate('subtasks'); // assumes Task has subtasks array
    if (task) {
      const allCompleted = task.subtasks.every(st => st.status === 'Completed');
      const anyInProgress = task.subtasks.some(st => st.status === 'In Progress');

      // Notify all users with role 'manager' if all subtasks are completed and task is now completed
      if (allCompleted && task.status !== 'Completed') {
        const managerUsers = await User.find({ role: 'manager' });
        const managerIds = managerUsers.map(u => u._id);
        await sendAlert({
          recipients: managerIds,
          message: `Task "${task.name}" is now completed. All subtasks are finished!`,
          type: "info",
          redirectTo: `/tasks/${task._id}`,
          persist: true
        });
        task.status = 'Completed';
      } else if (anyInProgress && task.status === 'Not Started') {
        task.status = 'In Progress';
      }

      await task.save();
    }

    // Notify assigned member(s) if their subtask is unlocked (all dependencies completed)
    // Only trigger if this subtask was just completed
    if (status === 'Completed') {
      // Find subtasks that depend on this subtask
      const dependentSubtasks = await Subtask.find({ dependencies: subtask._id });
      for (const depSubtask of dependentSubtasks) {
        // Check if all dependencies of depSubtask are completed
        const depSubtaskPop = await Subtask.findById(depSubtask._id).populate('dependencies');
        const allDepsCompleted = depSubtaskPop.dependencies.every(dep => dep.status === 'Completed');
        if (allDepsCompleted && depSubtaskPop.status === 'Not Started' && depSubtaskPop.assignedMember) {
          // Find user for assignedMember
          const user = await User.findOne({ member: depSubtaskPop.assignedMember });
          if (user) {
            await sendAlert({
              recipients: [user._id],
              message: `Your subtask "${depSubtaskPop.name}" is now unlocked! All dependencies are completed. You may start working on it now.`,
              type: "info",
              redirectTo: `/subtasks/${depSubtaskPop._id}`,
              persist: true
            });
          }
        }
      }
    }

    res.status(200).json(subtask);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update subtask', error: error.message });
  }
};

export const deleteSubtask = async (req, res) => {
  try {
    const { id } = req.params;

    const subtask = await Subtask.findById(id);
    if (!subtask) return res.status(404).json({ message: 'Subtask not found' });

    await subtask.deleteOne();
    res.status(200).json({ message: 'Subtask deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete subtask', error: error.message });
  }
};



//subtask dependency resolver

export const assignSubtaskDependencies = async (subtaskMap, rawSubtasks) => {
  for (let i = 0; i < rawSubtasks.length; i++) {
    const { dependencies = [] } = rawSubtasks[i];
    const subtaskId = subtaskMap[i];

    if (!subtaskId) continue;

    const resolvedDeps = dependencies
      .map(depIndex => subtaskMap[depIndex])
      .filter(Boolean); // remove undefined

    await Subtask.findByIdAndUpdate(subtaskId, { dependencies: resolvedDeps });
  }
};
