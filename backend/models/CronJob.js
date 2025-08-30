import mongoose from 'mongoose';

const cronJobSchema = new mongoose.Schema({
  // Type of alert to send
  alertType: {
    type: String,
    enum: [
      'task_hard_deadline', 
      'subtask_soft_deadline',
      'subtask_hard_deadline'
    ],
    required: true
  },
  
  // When to execute this alert
  scheduledDate: {
    type: Date,
    required: true,
    index: true // Index for efficient querying
  },
  
  // References
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  
  subtaskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subtask',
    required: false // Only for subtask-specific alerts
  },
  
  // Company for filtering
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'processed', 'cancelled'],
    default: 'pending'
  },
  
  // Processing metadata
  processedAt: {
    type: Date,
    default: null
  },
  
  // Original deadline this alert is based on
  originalDeadline: {
    type: Date,
    required: true
  },
  
  // Additional metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
  
}, { timestamps: true });

// Compound index for efficient queries
cronJobSchema.index({ status: 1, scheduledDate: 1 });
cronJobSchema.index({ taskId: 1, status: 1 });
cronJobSchema.index({ company: 1, status: 1 });

// Auto-cleanup old processed jobs (optional)
cronJobSchema.index({ processedAt: 1 }, { 
  expireAfterSeconds: 30 * 24 * 60 * 60 // Delete after 30 days
});

export default mongoose.model('CronJob', cronJobSchema);
