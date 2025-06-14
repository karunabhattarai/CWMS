import mongoose from 'mongoose';

const taskTemplateSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
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
  subtasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubtaskTemplate'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const TaskTemplate = mongoose.model('TaskTemplate', taskTemplateSchema);
export default TaskTemplate;
