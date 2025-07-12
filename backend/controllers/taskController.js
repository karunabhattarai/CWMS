// controllers/taskController.js

import Task from '../models/Task.js';
import TaskTemplate from '../models/TaskTemplate.js';
import Subtask from '../models/Subtask.js';
import SubtaskTemplate from '../models/SubtaskTemplate.js';


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

    let createdSubtasks = [];

    // If taskTemplate is provided, populate from its subtasks
    if (taskTemplate) {
      const template = await TaskTemplate.findOne({ _id: taskTemplate, company }).populate('subtasks');
      if (!template) return res.status(404).json({ message: 'Task Template not found for this company' });

      createdSubtasks = await Promise.all(
        template.subtasks.map(async (subtaskTemplateId) => {
          const subtask = new Subtask({
            task: task._id,
            subtaskTemplate: subtaskTemplateId
          });
          await subtask.save();
          return subtask._id;
        })
      );
    } else {
      // Manually provided subtasks: either via template or raw
      createdSubtasks = await Promise.all(
        subtasks.map(async (sub) => {
          if (sub.subtaskTemplate) {
            const subtask = new Subtask({
              task: task._id,
              subtaskTemplate: sub.subtaskTemplate
            });
            await subtask.save();
            return subtask._id;
          } else if (sub.name && sub.role && sub.estimatedDurationDays) {
            const subtask = new Subtask({
              task: task._id,
              name: sub.name,
              role: sub.role,
              description: sub.description || '',
              estimatedDurationDays: sub.estimatedDurationDays
            });
            await subtask.save();
            return subtask._id;
          } else {
            throw new Error('Invalid subtask format: must provide either subtaskTemplate or raw fields');
          }
        })
      );
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

// testing
// export const getAllTasks = async (req, res) => {
//   try {
//     // Just fetch subtasks directly for that task ID to verify
//     const subs = await Subtask.find({ task: '68727c4674068c0b2a3d5802' });
//     console.log(subs);

//     const tasks = await Task.find({ company: req.user.company })
//       .populate('taskTemplate')
//       .populate({
//         path: 'subtasks',
//         populate: {
//           path: 'subtaskTemplate',
//           select: 'name'
//         }
//       })
//       .populate({
//         path: 'subtasks',
//         populate: {
//           path: 'assignedMember',
//           select: 'name'
//         }
//       });

//     res.status(200).json(tasks);
//   } catch (error) {
//     res.status(500).json({ message: 'Internal server error', error: error.message });
//   }
// };
//testing

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, deadline, subtasks } = req.body;

    const task = await Task.findOne({ _id: id, company: req.user.company });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Update basic fields
    task.name = name || task.name;
    task.deadline = deadline || task.deadline;

    if (subtasks && Array.isArray(subtasks)) {
      const newSubtaskIds = [];

      for (const s of subtasks) {
        if (s.subtaskTemplate) {
          // Use existing template
          const newSubtask = new Subtask({
            task: task._id,
            subtaskTemplate: s.subtaskTemplate
          });
          await newSubtask.save();
          newSubtaskIds.push(newSubtask._id);
        } else if (s.role && s.name && s.estimatedDurationDays) {
          // Direct raw subtask (no template)
          const newSubtask = new Subtask({
            task: task._id,
            name: s.name,
            role: s.role,
            description: s.description || '',
            estimatedDurationDays: s.estimatedDurationDays
          });
          await newSubtask.save();
          newSubtaskIds.push(newSubtask._id);
        } else {
          return res.status(400).json({

            message: 'Each subtask must have either "subtaskTemplate" OR all of "role", "name", "estimatedDurationDays"'
          });
        }
      }

      // Replace old subtasks
      await Subtask.deleteMany({
        task: task._id,
        _id: { $nin: newSubtaskIds}
      });
      task.subtasks = newSubtaskIds;
    }

    await task.save();
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
