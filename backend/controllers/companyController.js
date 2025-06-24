// controllers/companyController.js
import Company from '../models/Company.js';

export const createCompany = async (req, res) => {
  try {
    console.log('req.user:', req.user);
    const { name} = req.body;
    const user = req.user; // Assuming user is set by authMiddleware
    if (!name) return res.status(400).json({ message: 'Company name is required' });

    const existing = await Company.findOne({ name });
    if (existing) return res.status(400).json({ message: 'Company already exists' });

    const newCompany = new Company({ name, createdBy: user._id });
    await newCompany.save();

    // Assign this company to the superadmin user and save
    user.company = newCompany._id;
    await user.save();

    res.status(201).json(newCompany);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
