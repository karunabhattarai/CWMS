import Member from '../models/Member.js';

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
