// imports from /algorithms and calls them

import Task from '../models/Task.js';
import Subtask from '../models/Subtask.js';
import { calculateCPM } from '../algorithms/cpm.js';

export async function getTaskCPM(taskId) {
  const task = await Task.findById(taskId).populate({
    path: 'subtasks',
    populate: { path: 'dependencies subtaskTemplate' }
  });

  if (!task) throw new Error('Task not found');
  return calculateCPM(task.subtasks);
};
