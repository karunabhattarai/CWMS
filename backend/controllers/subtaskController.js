// controllers/subtaskController.js

import Subtask from '../models/Subtask.js';
import Task from '../models/Task.js';


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

// changes status 
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

      console.log(allCompleted);
      console.log(anyInProgress);
      if (allCompleted && task.status !== 'Completed') {
        task.status = 'Completed';
      } else if (anyInProgress && task.status === 'Not Started') {
        task.status = 'In Progress';
      }

      await task.save();
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
