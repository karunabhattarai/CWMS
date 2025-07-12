import SubtaskTemplate from '../models/SubtaskTemplate.js';

export const createSubtaskTemplate = async (req, res) => {
  try {
    const { role, name, description, estimatedDurationDays } = req.body;

    if (!req.user.company) {
      return res.status(403).json({ message: 'No company assigned to this user.' });
    }

    const newSubtaskTemplate = new SubtaskTemplate({
      role,
      name,
      description,
      estimatedDurationDays,
    });

    await newSubtaskTemplate.save();
    res.status(201).json(newSubtaskTemplate);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

export const getAllSubtaskTemplates = async (req, res) => {
  try {
    const templates = await SubtaskTemplate.find()
      .populate('role', 'name description');
    res.status(200).json(templates);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

export const updateSubtaskTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, estimatedDurationDays, role } = req.body;

    const template = await SubtaskTemplate.findById(id);
    if (!template) return res.status(404).json({ message: 'Subtask template not found' });

    if (role) template.role = role;
    if (name) template.name = name;
    if (description !== undefined) template.description = description;
    if (estimatedDurationDays) template.estimatedDurationDays = estimatedDurationDays;

    await template.save();
    res.status(200).json(template);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

export const deleteSubtaskTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    const template = await SubtaskTemplate.findById(id);
    if (!template) return res.status(404).json({ message: 'Subtask template not found' });

    await template.deleteOne();
    res.status(200).json({ message: 'Subtask template deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};
