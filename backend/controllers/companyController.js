// controllers/companyController.js
import Company from '../models/Company.js';

export const createCompany = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Company name is required' });

    const existing = await Company.findOne({ name });
    if (existing) return res.status(400).json({ message: 'Company already exists' });

    const newCompany = new Company({ name });
    await newCompany.save();

    res.status(201).json(newCompany);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
