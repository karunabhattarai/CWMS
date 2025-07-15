// controllers/taskController.js

import Task from '../models/Task.js';
import TaskTemplate from '../models/TaskTemplate.js';
import Subtask from '../models/Subtask.js';
import SubtaskTemplate from '../models/SubtaskTemplate.js';
import {assignSubtaskDependencies} from './subtaskController.js';  

// import { resolveSubtaskDependenciesByName } from '../algorithms/cpm.js';


export const createTask = async (req, res) => {
  try {
    const { taskTemplate, name, deadline, subtasks = [] } = req.body;
    const company = req.user.company;

    if (!company) {
      return res.status(400).json({ message: 'User has no company assigned' });
    }

    const task = new Task({
      company,
      taskTemplate: taskTemplate || null,
      name,
      deadline
    });
    await task.save();

    const createdSubtasks = [];
    const subtaskIndexToId = {}; // for dependency mapping

    if (taskTemplate) {
      // From template
      const template = await TaskTemplate.findOne({ _id: taskTemplate, company }).populate('subtasks');
      if (!template) return res.status(404).json({ message: 'Task Template not found for this company' });

      for (let i = 0; i < template.subtasks.length; i++) {
        const { subtaskTemplate, dependencies = [] } = template.subtasks[i];
        const templateDoc = await SubtaskTemplate.findById(subtaskTemplate);
        if (!templateDoc) continue;

        const subtask = new Subtask({
          task: task._id,
          subtaskTemplate: templateDoc._id,
          estimatedDurationDays: templateDoc.estimatedDurationDays
        });

        await subtask.save();
        createdSubtasks.push(subtask._id);
        subtaskIndexToId[i] = subtask._id;
      }

      // Optional: fetch dependencies from templates and apply here
      const fakeFrontendSubtasks = template.subtasks.map((t) => ({
        dependencies: t.dependencies || []
      }));
      await assignSubtaskDependencies(subtaskIndexToId, fakeFrontendSubtasks);
    } else {
      // Manually created subtasks
      for (let i = 0; i < subtasks.length; i++) {
        const sub = subtasks[i];
        let subtask;

        if (sub.subtaskTemplate) {
          subtask = new Subtask({
            task: task._id,
            subtaskTemplate: sub.subtaskTemplate
          });
        } else if (sub.name && sub.role && sub.estimatedDurationDays) {
          subtask = new Subtask({
            task: task._id,
            name: sub.name,
            role: sub.role,
            description: sub.description || '',
            estimatedDurationDays: sub.estimatedDurationDays
          });
        } else {
          return res.status(400).json({
            message: 'Each subtask must have either "subtaskTemplate" OR all of "role", "name", "estimatedDurationDays"'
          });
        }

        await subtask.save();
        createdSubtasks.push(subtask._id);
        subtaskIndexToId[i] = subtask._id;
      }

      // Assign dependencies from frontend
      await assignSubtaskDependencies(subtaskIndexToId, subtasks);
    }

    task.subtasks = createdSubtasks;
    await task.save();

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


export const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ company: req.user.company })
      .populate('taskTemplate')
      .populate({
        path: 'subtasks',
        populate: [
          { path: 'subtaskTemplate', select: 'name' },
          { path: 'assignedMember', select: 'name' }
        ]
      });

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, deadline, subtasks = [] } = req.body;

    const task = await Task.findOne({ _id: id, company: req.user.company });
    if (!task) return res.status(404).json({ message: 'Task not found' });

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
          subtaskTemplate: s.subtaskTemplate
        });
      } else if (s.role && s.name && s.estimatedDurationDays) {
        newSubtask = new Subtask({
          task: task._id,
          name: s.name,
          role: s.role,
          description: s.description || '',
          estimatedDurationDays: s.estimatedDurationDays
        });
      } else {
        return res.status(400).json({
          message: 'Each subtask must have either "subtaskTemplate" OR all of "role", "name", "estimatedDurationDays"'
        });
      }

      await newSubtask.save();
      newSubtaskIds.push(newSubtask._id);
      subtaskIndexToId[i] = newSubtask._id;
    }

    // Delete old subtasks (not in new list)
    await Subtask.deleteMany({
      task: task._id,
      _id: { $nin: newSubtaskIds }
    });

    task.subtasks = newSubtaskIds;
    await task.save();

    // Assign dependencies after all subtasks are saved
    await assignSubtaskDependencies(subtaskIndexToId, subtasks);

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOne({ _id: id, company: req.user.company });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Delete all subtasks
    await Subtask.deleteMany({ task: task._id });

    // Delete the task
    await task.deleteOne();

    res.status(200).json({ message: 'Task and related subtasks deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
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