import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
  url: String,
  type: { type: String, enum: ['photo', 'pdf', 'link'], required: true }
}, { _id: false });

const subtaskSchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  subtaskTemplate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubtaskTemplate',
    required: true
  },
  assignedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed'],
    default: 'Not Started'
  },
  comment: {
    type: String,
    default: ''
  },
  attachments: [attachmentSchema],
  startedAt: Date,
  completedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Subtask = mongoose.model('Subtask', subtaskSchema);
export default Subtask;
