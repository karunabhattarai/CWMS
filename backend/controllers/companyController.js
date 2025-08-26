// controllers/companyController.js
import Company from "../models/Company.js";
import User from "../models/User.js";
import Role from "../models/Role.js";
import Member from "../models/Member.js";
import jwt from "jsonwebtoken";
// import TaskTemplate from '../models/TaskTemplate.js';
// import SubtaskTemplate from '../models/SubtaskTemplate.js';
// import Task from '../models/Task.js';
// import Subtask from '../models/Subtask.js';  // Add after implement
// importing for cascade delete

export const createCompany = async (req, res) => {
  try {
    const { name } = req.body;
    const user = req.user; // Assuming user is set by authMiddleware
    if (!name)
      return res.status(400).json({ message: "Company name is required" });

    const existing = await Company.findOne({ name });
    if (existing)
      return res.status(400).json({ message: "Company already exists" });

    const newCompany = new Company({ name, createdBy: user._id });
    await newCompany.save();

    // Assign this company to the superadmin user and save
    user.company = newCompany._id;
    await user.save();

    // Generate new JWT token with updated company information
    const newToken = jwt.sign(
      {
        id: user._id,
        company: newCompany._id,
        companyName: newCompany.name,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      company: newCompany,
      token: newToken,
      message: "Company created successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

//get company
export const getCompany = async (req, res) => {
  try {
    if (!req.user.company) {
      return res
        .status(404)
        .json({ message: "No company assigned to this user" });
    }

    const company = await Company.findById(req.user.company).populate(
      "createdBy",
      "name email"
    );
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.status(200).json(company);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

//update company
export const updateCompany = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!req.user.company) {
      return res
        .status(404)
        .json({ message: "No company assigned to this user" });
    }

    const company = await Company.findById(req.user.company);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    company.name = name || company.name;
    company.description = description || company.description;

    const updatedCompany = await company.save();
    res.status(200).json(updatedCompany);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// seriousss deletes everything except the superadmin
export const deleteCompany = async (req, res) => {
  try {
    if (!req.user.company) {
      return res
        .status(404)
        .json({ message: "No company assigned to this Superadmin" });
    }

    const company = await Company.findById(req.user.company);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const companyId = company._id;

    // Delete company itself
    await company.deleteOne();

    // Cascade delete related data
    await Promise.all([
      User.deleteMany({ company: companyId, role: { $ne: "superadmin" } }),
      Role.deleteMany({ company: companyId }),
      Member.deleteMany({ company: companyId }),
      // TaskTemplate.deleteMany({ company: companyId }),
      // SubtaskTemplate.deleteMany({ company: companyId }),
      // Task.deleteMany({ company: companyId }),
      // Subtask.deleteMany({ company: companyId }),
    ]);

    req.user.company = null;
    await req.user.save();

    res
      .status(200)
      .json({ message: "Company and related data deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
