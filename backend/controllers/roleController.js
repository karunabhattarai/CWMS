// controllers/roleController.js
import Role from '../models/Role.js';

export const createRole = async (req, res) => {
  try {
    const { name, description } = req.body;
    const company = req.user.company;

    if (!company) {
      return res.status(400).json({ message: 'Role Creator has no company assigned' });
    }

    const role = new Role({ name, description, company });
    await role.save();
    res.status(201).json(role);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find({ company: req.user.company });
    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    if (!req.user.company) {
      return res.status(400).json({ message: 'Role Creator has no company assigned' });
    }
    const role = await Role.findOne({ _id: id, company: req.user.company });
    if (!role) return res.status(404).json({ message: 'Role not found' });

    role.name = name || role.name;
    role.description = description || role.description;

    await role.save();
    res.status(200).json(role);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const deleteRole = async (req, res) => {
  try {
    if (!req.user.company) {
      return res.status(400).json({ message: 'Role Creator has no company assigned' });
    }
    const { id } = req.params;

    const role = await Role.findOne({ _id: id, company: req.user.company });
    if (!role) return res.status(404).json({ message: 'Role not found' });

    await role.deleteOne();
    res.status(200).json({ message: 'Role deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
