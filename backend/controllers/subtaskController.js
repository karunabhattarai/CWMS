// controllers/subtaskController.js

import Subtask from '../models/Subtask.js';

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
    const subtask = await Subtask.findById(id);
    if (!subtask) return res.status(404).json({ message: 'Subtask not found' });

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
