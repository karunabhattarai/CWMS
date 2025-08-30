import cron from 'node-cron';
import Task from '../models/Task.js';
import Subtask from '../models/Subtask.js';
import CronJob from '../models/CronJob.js';
import { softDeadlineAlert, hardDeadlineAlert, managerEscalationAlert } from './alertService.js';

class DynamicCronService {
  constructor() {
    this.jobs = new Map(); // Map of jobId -> cronJob
  }

  // Initialize the service and set up daily scheduler
  initialize() {
    // Run every hour to check for due alerts
    this.setupHourlyChecker();
    console.log('✅ Dynamic Cron Service initialized');
  }

  // Setup hourly checker that processes due alerts
  setupHourlyChecker() {
    const job = cron.schedule('0 * * * *', async () => {
      console.log('🕐 Running hourly deadline check...');
      await this.processScheduledAlerts();
    }, {
      scheduled: true,
      timezone: "Asia/Kathmandu"
    });
    
    this.jobs.set('hourlyChecker', job);
    console.log('⏰ Hourly deadline checker started');
  }

  // Update cron list when tasks are created/updated
  async updateCronListForTask(taskId) {
    try {
      // Remove existing entries for this task
      await this.removeCronEntriesForTask(taskId);

      // Get task with subtasks
      const task = await Task.findById(taskId).populate('subtasks');
      if (!task) return;

      // Calculate and add task-level deadlines
      await this.addTaskDeadlinesToCronList(task);

      // Calculate and add subtask-level deadlines
      for (const subtask of task.subtasks) {
        await this.addSubtaskDeadlinesToCronList(subtask, task);
      }

      console.log(`📅 Updated cron list for task: ${task.name}`);
    } catch (error) {
      console.error('❌ Error updating cron list for task:', error);
    }
  }

  // Add task deadlines to cron list
  async addTaskDeadlinesToCronList(task) {
    const now = new Date();
    const deadline = new Date(task.deadline);
    
    // Calculate soft deadline (2 days before)
    const softDeadline = new Date(deadline);
    softDeadline.setDate(softDeadline.getDate() - 2);

    // Add to database if deadlines are in the future
    if (softDeadline > now) {
      await CronJob.create({
        cronId: `task_soft_${task._id}`,
        alertType: 'task_soft_deadline',
        scheduledDate: softDeadline,
        taskId: task._id,
        company: task.company,
        originalDeadline: deadline,
        metadata: {
          taskName: task.name
        }
      });
    }

    if (deadline > now) {
      await CronJob.create({
        cronId: `task_hard_${task._id}`,
        alertType: 'task_hard_deadline',
        scheduledDate: deadline,
        taskId: task._id,
        company: task.company,
        originalDeadline: deadline,
        metadata: {
          taskName: task.name
        }
      });
    }
  }

  // Add subtask deadlines to cron list
  async addSubtaskDeadlinesToCronList(subtask, task) {
    const now = new Date();
    
    // Use earliestFinish from CPM calculation as the estimated deadline
    let estimatedDeadline = subtask.earliestFinish || task.deadline;
    if (typeof estimatedDeadline === 'string') {
      estimatedDeadline = new Date(estimatedDeadline);
    }

    // Calculate soft deadline (2 days before estimated completion)
    const softDeadline = new Date(estimatedDeadline);
    softDeadline.setDate(softDeadline.getDate() - 2);

    // Add to database if deadlines are in the future and subtask is assigned
    if (subtask.assignedMember && subtask.status !== 'Completed') {
      if (softDeadline > now) {
        await CronJob.create({
          cronId: `subtask_soft_${subtask._id}`,
          alertType: 'subtask_soft_deadline',
          scheduledDate: softDeadline,
          taskId: task._id,
          subtaskId: subtask._id,
          company: task.company,
          originalDeadline: estimatedDeadline,
          metadata: {
            taskName: task.name,
            subtaskName: subtask.name,
            assignedMember: subtask.assignedMember
          }
        });
      }

      if (estimatedDeadline > now) {
        await CronJob.create({
          cronId: `subtask_hard_${subtask._id}`,
          alertType: 'subtask_hard_deadline',
          scheduledDate: estimatedDeadline,
          taskId: task._id,
          subtaskId: subtask._id,
          company: task.company,
          originalDeadline: estimatedDeadline,
          metadata: {
            taskName: task.name,
            subtaskName: subtask.name,
            assignedMember: subtask.assignedMember
          }
        });
      }
    }
  }

  // Process all scheduled alerts that are due
  async processScheduledAlerts() {
    try {
      const now = new Date();
      
      // Find all pending alerts that are due
      const dueAlerts = await CronJob.find({
        status: 'pending',
        scheduledDate: { $lte: now }
      }).populate('taskId').populate('subtaskId');

      // Process each alert
      for (const cronJob of dueAlerts) {
        await this.processAlert(cronJob);
        
        // Mark as processed
        cronJob.status = 'processed';
        cronJob.processedAt = new Date();
        await cronJob.save();
      }

      if (dueAlerts.length > 0) {
        console.log(`✅ Processed ${dueAlerts.length} scheduled alerts`);
      }
    } catch (error) {
      console.error('❌ Error processing scheduled alerts:', error);
    }
  }

  // Process individual alert
  async processAlert(cronJob) {
    try {
      const task = cronJob.taskId;
      if (!task) return;

      switch (cronJob.alertType) {
        case 'subtask_soft_deadline':
          const subtask = cronJob.subtaskId;
          if (subtask && subtask.status !== 'Completed') {
            await softDeadlineAlert(subtask, task);
          }
          break;

        case 'subtask_hard_deadline':
          const hardSubtask = cronJob.subtaskId;
          if (hardSubtask && hardSubtask.status !== 'Completed') {
            await hardDeadlineAlert(hardSubtask, task);
          }
          break;

        case 'task_soft_deadline':
          // Send soft deadline alert to all assigned members
          const taskSubtasks = await Subtask.find({ 
            task: task._id, 
            status: { $ne: 'Completed' },
            assignedMember: { $exists: true }
          });
          
          for (const sub of taskSubtasks) {
            await softDeadlineAlert(sub, task);
          }
          break;

        case 'task_hard_deadline':
          // Send hard deadline alert to all assigned members
          const hardTaskSubtasks = await Subtask.find({ 
            task: task._id, 
            status: { $ne: 'Completed' },
            assignedMember: { $exists: true }
          });
          
          for (const sub of hardTaskSubtasks) {
            await hardDeadlineAlert(sub, task);
          }
          break;
      }
    } catch (error) {
      console.error(`❌ Error processing alert ${cronJob.cronId}:`, error);
    }
  }

  // Remove cron entries for a specific task (when task is deleted/updated)
  async removeCronEntriesForTask(taskId) {
    try {
      const result = await CronJob.updateMany(
        { taskId: taskId, status: 'pending' },
        { status: 'cancelled' }
      );
      
      console.log(`�️ Cancelled ${result.modifiedCount} cron entries for task ${taskId}`);
    } catch (error) {
      console.error('❌ Error removing cron entries for task:', error);
    }
  }

  // Handle user response to soft deadline alert
  async handleSoftDeadlineResponse(subtaskId, canComplete) {
    try {
      const subtask = await Subtask.findById(subtaskId).populate('assignedMember');
      const task = await Task.findById(subtask.task);
      
      if (!canComplete) {
        // User says they can't complete on time - escalate to manager
        const User = (await import("../models/User.js")).default;
        const user = await User.findOne({ member: subtask.assignedMember._id });
        
        if (user) {
          await managerEscalationAlert(subtask, task, user);
        }
      }
      
      // Log the response for tracking
      console.log(`📝 Soft deadline response for ${subtask.name}: ${canComplete ? 'Can complete' : 'Cannot complete'}`);
      
    } catch (error) {
      console.error('❌ Error handling soft deadline response:', error);
    }
  }

  // Get current cron list status
  async getCronListStatus() {
    try {
      const totalScheduled = await CronJob.countDocuments({ status: 'pending' });
      
      // Count by type
      const byTypeAggregation = await CronJob.aggregate([
        { $match: { status: 'pending' } },
        { $group: { _id: '$alertType', count: { $sum: 1 } } }
      ]);
      
      const byType = {};
      byTypeAggregation.forEach(item => {
        byType[item._id] = item.count;
      });

      // Get next 10 upcoming alerts
      const upcoming = await CronJob.find({ status: 'pending' })
        .sort({ scheduledDate: 1 })
        .limit(10)
        .select('cronId alertType scheduledDate taskId subtaskId metadata');

      return {
        totalScheduled,
        byType,
        upcoming
      };
    } catch (error) {
      console.error('❌ Error getting cron list status:', error);
      return { totalScheduled: 0, byType: {}, upcoming: [] };
    }
  }

  // Cleanup method
  destroy() {
    // Stop all cron jobs
    for (const [name, job] of this.jobs.entries()) {
      job.stop();
      console.log(`🛑 Stopped cron job: ${name}`);
    }
    
    // Clear maps
    this.jobs.clear();
    
    console.log('🧹 Dynamic Cron Service destroyed');
  }
}

// Create singleton instance
const dynamicCronService = new DynamicCronService();

export default dynamicCronService;
