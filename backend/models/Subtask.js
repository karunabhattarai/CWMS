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
    required: false // optional since can be made aafai pani by the manager
  },
  name: {
    type: String,
    required: true
  },
  assignedMember: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member'
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

  // for cpm
  estimatedDurationDays: {
    type: Number,
    default:1,
    min:0
  },
  dependencies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subtask'
  }],
  // earliestStart: Date,
  // earliestFinish: Date,
  // latestStart: Date,
  // latestFinish: Date,
  
  earliestStart: {
    type: Date,
    default: null
  },
  earliestFinish: {
    type: Date,
    default: null
  },
  latestStart: {
    type: Date,
    default: null
  },
  latestFinish: {
    type: Date,
    default: null
  },
  float: {
    type: Number,
    default: 0
  },
  isCritical: {
    type: Boolean,
    default: false
  },
  //mathiko for cpm
  // createdAt: {
  //   type: Date,
  //   default: Date.now
  // } timestamps true rakhem tala
}, { timestamps: true });

const Subtask = mongoose.model('Subtask', subtaskSchema);
export default Subtask;
