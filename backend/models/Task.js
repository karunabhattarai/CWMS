import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  taskTemplate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TaskTemplate',
    required: false // optional since can be made aafai pani by the manager
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed'],
    default: 'Not Started'
  },
  priority: {
    type: String,
    enum: ['urgent', 'high', 'moderate', 'low'],
    default: 'moderate'
  },
  deadline: {
    type: Date,
    required: true
  },
  startDate: {
    type: Date,
    default: null
  },
  subtasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subtask'
  }]
}, {timestamps: true});

const Task = mongoose.model('Task', taskSchema);
export default Task;
// This code defines a Mongoose schema for a Task model, which includes fields for the company, task template, name, deadline, start date, subtasks, and creation date. The schema is then used to create a Mongoose model named 'Task'.
// The Task model is used to represent tasks in the system, linking them to a company and a task template, and allowing for the management of subtasks associated with each task.