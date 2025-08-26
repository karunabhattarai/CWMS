// controllers/employeeController.js
import User from "../models/User.js";
import Member from "../models/Member.js";
import Subtask from "../models/Subtask.js";
import Task from "../models/Task.js";
import Company from "../models/Company.js";

// Helper function to ensure member exists for employee
const ensureMemberExists = async (user) => {
  if (!user.member && user.role === "employee") {
    // Create a member record for this employee if it doesn't exist
    const member = new Member({
      name: user.name,
      email: user.email,
      company: user.company,
      roles: [], // Default empty roles, can be updated later
    });
    await member.save();

    // Update user with member reference
    user.member = member._id;
    await user.save();

    return member;
  }
  return user.member;
};

// Get employee dashboard data
export const getEmployeeDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId)
      .populate("member")
      .populate("company", "name")
      .populate({
        path: "member",
        populate: {
          path: "roles",
          select: "name",
        },
      });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure member exists for employee
    let member = user.member;
    if (!member && user.role === "employee") {
      member = await ensureMemberExists(user);
      // Refetch user with populated member
      const updatedUser = await User.findById(userId)
        .populate("member")
        .populate("company", "name")
        .populate({
          path: "member",
          populate: {
            path: "roles",
            select: "name",
          },
        });
      member = updatedUser.member;
    }

    if (!member) {
      return res
        .status(404)
        .json({ message: "Employee member record not found" });
    }

    const memberId = member._id;

    // Get subtask statistics
    const subtaskStats = await Subtask.aggregate([
      { $match: { assignedMember: memberId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get missed deadlines (subtasks past deadline that aren't completed)
    const missedDeadlines = await Subtask.countDocuments({
      assignedMember: memberId,
      status: { $ne: "Completed" },
      deadline: { $lt: new Date() },
    });

    // Format subtask stats
    const stats = {
      total: 0,
      notStarted: 0,
      inProgress: 0,
      completed: 0,
    };

    subtaskStats.forEach((stat) => {
      stats.total += stat.count;
      switch (stat._id) {
        case "Not Started":
          stats.notStarted = stat.count;
          break;
        case "In Progress":
          stats.inProgress = stat.count;
          break;
        case "Completed":
          stats.completed = stat.count;
          break;
      }
    });

    res.json({
      employee: {
        name: user.name,
        email: user.email,
        roles: member.roles ? member.roles.map((role) => role.name) : [],
        company: user.company ? user.company.name : "No Company",
      },
      subtaskStats: stats,
      missedDeadlines,
      ongoingSubtasks: stats.inProgress + stats.notStarted,
    });
  } catch (error) {
    console.error("Error fetching employee dashboard:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all subtasks assigned to the employee across all projects
export const getEmployeeSubtasks = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate("member");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure member exists for employee
    let member = user.member;
    if (!member && user.role === "employee") {
      member = await ensureMemberExists(user);
    }

    if (!member) {
      return res
        .status(404)
        .json({ message: "Employee member record not found" });
    }

    const subtasks = await Subtask.find({
      assignedMember: member._id,
    })
      .populate("task", "name")
      .populate("assignedMember", "name email")
      .sort({ createdAt: -1 });

    res.json(subtasks);
  } catch (error) {
    console.error("Error fetching employee subtasks:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get projects assigned to employee (projects with subtasks assigned to them)
export const getEmployeeProjects = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate("member");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure member exists for employee
    let member = user.member;
    if (!member && user.role === "employee") {
      member = await ensureMemberExists(user);
    }

    if (!member) {
      return res
        .status(404)
        .json({ message: "Employee member record not found" });
    }

    // Find all subtasks assigned to this member
    const subtasks = await Subtask.find({
      assignedMember: member._id,
    }).populate("task");

    // Get unique projects (tasks) from subtasks
    const projectIds = [
      ...new Set(subtasks.map((subtask) => subtask.task._id.toString())),
    ];

    const projects = await Task.find({
      _id: { $in: projectIds },
    })
      .populate("subtasks")
      .populate({
        path: "subtasks",
        populate: {
          path: "assignedMember",
          select: "name",
        },
      });

    // Add project progress and employee subtask count
    const projectsWithStats = projects.map((project) => {
      const employeeSubtasks = project.subtasks.filter(
        (subtask) =>
          subtask.assignedMember &&
          subtask.assignedMember._id.toString() === member._id.toString()
      );

      const totalSubtasks = project.subtasks.length;
      const completedSubtasks = project.subtasks.filter(
        (s) => s.status === "Completed"
      ).length;
      const progress =
        totalSubtasks > 0
          ? Math.round((completedSubtasks / totalSubtasks) * 100)
          : 0;

      return {
        ...project.toObject(),
        employeeSubtaskCount: employeeSubtasks.length,
        progress,
      };
    });

    res.json(projectsWithStats);
  } catch (error) {
    console.error("Error fetching employee projects:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update subtask status (employee can only update their own subtasks)
export const updateEmployeeSubtask = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { status, comment, attachments } = req.body;

    const user = await User.findById(userId).populate("member");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure member exists for employee
    let member = user.member;
    if (!member && user.role === "employee") {
      member = await ensureMemberExists(user);
    }

    if (!member) {
      return res
        .status(404)
        .json({ message: "Employee member record not found" });
    }

    const subtask = await Subtask.findOne({
      _id: id,
      assignedMember: member._id,
    });

    if (!subtask) {
      return res
        .status(404)
        .json({ message: "Subtask not found or not assigned to you" });
    }

    // Update allowed fields
    if (status !== undefined) {
      subtask.status = status;

      // Update timestamps based on status
      if (status === "In Progress" && !subtask.startedAt) {
        subtask.startedAt = new Date();
      } else if (status === "Completed" && !subtask.completedAt) {
        subtask.completedAt = new Date();
      }
    }

    if (comment !== undefined) subtask.comment = comment;
    if (attachments !== undefined) subtask.attachments = attachments;

    await subtask.save();

    const updatedSubtask = await Subtask.findById(id)
      .populate("task", "name")
      .populate("assignedMember", "name email");

    res.json(updatedSubtask);
  } catch (error) {
    console.error("Error updating subtask:", error);
    res.status(500).json({ message: "Server error" });
  }
};
