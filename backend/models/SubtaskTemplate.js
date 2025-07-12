import mongoose from 'mongoose';

const subtaskTemplateSchema = new mongoose.Schema({
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
  },
  estimatedDurationDays: {
    type: Number,
    required: true,
    min: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const SubtaskTemplate = mongoose.model('SubtaskTemplate', subtaskTemplateSchema);
export default SubtaskTemplate;
// This model defines a subtask template with a reference to a role, name, description, estimated duration in days, and creation date.
// It is used to create reusable subtask templates that can be assigned to tasks in the system.