import Member from '../models/Member.js';
import Task from '../models/Task.js';
import Subtask from '../models/Subtask.js';

export const createMemberInternal = async ({ name, email, roles, company }) => {
  const member = new Member({ name, email, roles, company });
  return await member.save();
};
// upper helper user bata call garna ko lagi, did not want to del talako, not needed hunalai

export const createMember = async (req, res) => {
  try {
    const { name, email, roles } = req.body;
    const company = req.user.company;

    if (!company) {
      return res.status(400).json({ message: 'User has no company assigned' });
    }

    const member = await createMemberInternal({ name, email, roles, company });
    res.status(201).json(member);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getAllMembers = async (req, res) => {
  try {
    const members = await Member.find({ company: req.user.company }).populate('roles');
    res.status(200).json(members);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getAllOccupiedMembers = async (req, res) => {
  try {
    const company = req.user.company;
    
    if (!company) {
      return res.status(400).json({ message: 'User has no company assigned' });
    }

    // Get all members for the company
    const allMembers = await Member.find({ company }).populate('roles');
    
    // Get all active subtasks (not completed) with assigned members and their tasks
    const activeSubtasks = await Subtask.find({
      assignedMember: { $exists: true, $ne: null },
      status: { $ne: 'Completed' }
    })
    .populate({
      path: 'task',
      match: { company: company },
      select: '_id name deadline status'
    })
    .populate('assignedMember', '_id name');

    // Filter out subtasks where task is null (doesn't belong to company)
    const validSubtasks = activeSubtasks.filter(subtask => subtask.task !== null);

    // Group subtasks by member
    const memberTaskMap = new Map();
    
    validSubtasks.forEach(subtask => {
      const memberId = subtask.assignedMember._id.toString();
      if (!memberTaskMap.has(memberId)) {
        memberTaskMap.set(memberId, {
          member: subtask.assignedMember,
          tasks: []
        });
      }
      
      // Check if task is already added for this member
      const memberData = memberTaskMap.get(memberId);
      const existingTask = memberData.tasks.find(
        task => task._id.toString() === subtask.task._id.toString()
      );
      
      if (!existingTask) {
        memberData.tasks.push({
          _id: subtask.task._id,
          name: subtask.task.name,
          deadline: subtask.task.deadline,
          status: subtask.task.status
        });
      }
    });

    // Create response array with unoccupied members first
    const response = [];
    
    // Add unoccupied members first
    allMembers.forEach(member => {
      const memberId = member._id.toString();
      if (!memberTaskMap.has(memberId)) {
        response.push({
          _id: member._id,
          name: member.name,
          email: member.email,
          roles: member.roles,
          tasks: [],
          isOccupied: false
        });
      }
    });
    
    // Add occupied members
    allMembers.forEach(member => {
      const memberId = member._id.toString();
      if (memberTaskMap.has(memberId)) {
        const memberData = memberTaskMap.get(memberId);
        response.push({
          _id: member._id,
          name: member.name,
          email: member.email,
          roles: member.roles,
          tasks: memberData.tasks,
          isOccupied: true
        });
      }
    });

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, roles } = req.body;

    const member = await Member.findOne({ _id: id, company: req.user.company });
    if (!member) return res.status(404).json({ message: 'Member not found' });

    member.name = name || member.name;
    member.email = email || member.email;
    if (roles) member.roles = roles;

    await member.save();
    res.status(200).json(member);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;

    const member = await Member.findOne({ _id: id, company: req.user.company });
    if (!member) return res.status(404).json({ message: 'Member not found' });

    await member.deleteOne();
    res.status(200).json({ message: 'Member deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
