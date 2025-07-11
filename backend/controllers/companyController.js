// controllers/companyController.js
import Company from '../models/Company.js';

export const createCompany = async (req, res) => {
  try {
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

//get company
export const getCompany = async (req, res) => {
  try {
    if (!req.user.company) {
      return res.status(404).json({ message: 'No company assigned to this user' });
    }

    const company = await Company.findById(req.user.company).populate('createdBy', 'name email');
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

//update company
export const updateCompany = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!req.user.company) {
      return res.status(404).json({ message: 'No company assigned to this user' });
    }

    const company = await Company.findById(req.user.company);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    company.name = name || company.name;
    company.description = description || company.description;

    const updatedCompany = await company.save();
    res.status(200).json(updatedCompany);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const deleteCompany = async (req, res) => {
  try {
    if (!req.user.company) {
      return res.status(404).json({ message: 'No company assigned to this Superadmin' });
    }

    const company = await Company.findById(req.user.company);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // await Company.deleteOne({ _id: req.user.company });
    await company.deleteOne(); // simpler 


    // Optionally remove company reference from user
    req.user.company = null;
    await req.user.save();

    res.status(200).json({ message: 'Company deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
