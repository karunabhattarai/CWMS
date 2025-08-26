import TaskTemplate from '../models/TaskTemplate.js';

export const createTaskTemplate = async (req, res) => {
  try {
    const { name, description, subtasks } = req.body;
    const company = req.user.company;

    if (!company) {
      return res.status(403).json({ message: 'No company assigned to this user' });
    }

    const newTaskTemplate = new TaskTemplate({
      name,
      description,
      subtasks,
      company
    });

    await newTaskTemplate.save();
    res.status(201).json(newTaskTemplate);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

export const getAllTaskTemplates = async (req, res) => {
  try {
    const taskTemplates = await TaskTemplate.find({ company: req.user.company })
      .populate({
        path: 'subtasks.subtaskTemplate',
        populate: {
          path: 'role',
          select: 'name'
        }
      });

    res.status(200).json(taskTemplates);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

export const updateTaskTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, subtasks } = req.body;

    const taskTemplate = await TaskTemplate.findOne({ _id: id, company: req.user.company });
    if (!taskTemplate) {
      return res.status(404).json({ message: 'Task template not found' });
    }

    if (name) taskTemplate.name = name;
    if (description !== undefined) taskTemplate.description = description;
    if (subtasks) taskTemplate.subtasks = subtasks;

    await taskTemplate.save();
    res.status(200).json(taskTemplate);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

export const deleteTaskTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    const taskTemplate = await TaskTemplate.findOne({ _id: id, company: req.user.company });
    if (!taskTemplate) {
      return res.status(404).json({ message: 'Task template not found' });
    }

    await taskTemplate.deleteOne();
    res.status(200).json({ message: 'Task template deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};
