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
    subtaskTemplate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubtaskTemplate',
      required: true
    },
    dependencies: [{
      type: Number // indexes of dependent subtasks in this array
    }]
  }]
}, {timestamps: true});

const TaskTemplate = mongoose.model('TaskTemplate', taskTemplateSchema);
export default TaskTemplate;
