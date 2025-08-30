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
    // Run task scanner every 10 days to ensure all tasks have CronJobs
    this.setupTaskScanner();
    console.log('✅ Dynamic Cron Service initialized');
  }

  // Setup frequent checker that processes due alerts (every 10 minutes for testing)
  setupHourlyChecker() {
    // PRODUCTION: Every hour at minute 0
    // const job = cron.schedule('0 * * * *', async () => {
    //   console.log('🕐 Running hourly deadline check...');
    //   await this.processScheduledAlerts();
    // }, {
    //   scheduled: true,
    //   timezone: "Asia/Kathmandu"
    // });
    
    // TESTING: Every 10 minutes for quick testing
    // const job = cron.schedule('*/10 * * * *', async () => { 
    //   console.log('🕐 Running 10-minute deadline check...');
    const job = cron.schedule('*/1 * * * *', async () => {
      console.log('🕐 Running 1-minute deadline check...');
    // const job = cron.schedule('0 0 * * *', async () => {
    //   console.log('🕐 Running daily deadline check at midnight...');
      await this.processScheduledAlerts();
    }, {
      scheduled: true,
      timezone: "Asia/Kathmandu"
    });
    
    this.jobs.set('hourlyChecker', job);
    console.log('⏰ 1-minute deadline checker started (testing mode)');
  }

  // Setup task scanner that runs every 10 days to ensure all tasks have CronJobs
  setupTaskScanner() {
    // Run every 10 days at 2 AM
    const scannerJob = cron.schedule('0 2 */10 * *', async () => {
      console.log('🔍 Running comprehensive task scanner (every 10 days)...');
      await this.scanAllTasksForCronJobs();
    }, {
      scheduled: true,
      timezone: "Asia/Kathmandu"
    });
    
    this.jobs.set('taskScanner', scannerJob);
    console.log('🔍 Task scanner scheduled: runs every 10 days at 2 AM');
  }

  // Scan all tasks and ensure they have proper CronJobs
  async scanAllTasksForCronJobs() {
    try {
      console.log('🚀 Starting comprehensive task scan for CronJob validation...');
      
      // Get all active tasks (not completed/cancelled)
      const activeTasks = await Task.find({
        status: { $nin: ['Completed', 'Cancelled'] }
      }).populate('subtasks');

      console.log(`📋 Found ${activeTasks.length} active tasks to scan`);
      let updatedCount = 0;

      for (const task of activeTasks) {
        try {
          // Check if task has any CronJobs
          const existingCronJobs = await CronJob.find({ taskId: task._id });
          
          // If no CronJobs exist, or if task was recently updated, refresh them
          const taskLastModified = new Date(task.updatedAt);
          const tenDaysAgo = new Date();
          tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
          
          if (existingCronJobs.length === 0 || taskLastModified > tenDaysAgo) {
            console.log(`🔄 Updating CronJobs for task: "${task.name}" (${existingCronJobs.length} existing jobs)`);
            await this.updateCronListForTask(task._id);
            updatedCount++;
          }
        } catch (taskError) {
          console.error(`❌ Error processing task ${task._id}:`, taskError.message);
        }
      }

      console.log(`✅ Task scan completed: ${updatedCount}/${activeTasks.length} tasks updated`);
    } catch (error) {
      console.error('❌ Error during comprehensive task scan:', error);
    }

  }

  // Update cron list when tasks are created/updated
  async updateCronListForTask(taskId) {
    try {
      console.log(`🔄 Updating cron list for task: ${taskId}`);
      
      // Remove existing entries for this task
      await this.removeCronEntriesForTask(taskId);

      // Get task with subtasks
      const task = await Task.findById(taskId).populate('subtasks');
      if (!task) {
        console.log(`❌ Task ${taskId} not found`);
        return;
      }

      console.log(`📋 Task found: "${task.name}" with ${task.subtasks.length} subtasks`);

      // Calculate and add task-level deadlines
      await this.addTaskDeadlinesToCronList(task);

      // Calculate and add subtask-level deadlines
      for (const subtask of task.subtasks) {
        console.log(`🔧 Processing subtask: "${subtask.name}" (assigned: ${!!subtask.assignedMember}, status: ${subtask.status})`);
        await this.addSubtaskDeadlinesToCronList(subtask, task);
      }

      console.log(`📅 Updated cron list for task: ${task.name}`);
    } catch (error) {
      console.error('❌ Error updating cron list for task:', error);
    }
  }

  // Add task deadlines to cron list
  async addTaskDeadlinesToCronList(task) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day
    
    const taskDeadline = new Date(task.deadline);
    taskDeadline.setHours(0, 0, 0, 0); // Set to start of day

    // Only add hard deadline (when deadline date is today or future)
    if (taskDeadline >= today) {
      await CronJob.create({
        alertType: 'task_hard_deadline',
        scheduledDate: taskDeadline,
        taskId: task._id,
        company: task.company,
        originalDeadline: taskDeadline,
        metadata: {
          taskName: task.name
        }
      });
    }
  }

  // Add subtask deadlines to cron list
  async addSubtaskDeadlinesToCronList(subtask, task) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day
    
    // Use earliestFinish from CPM calculation as the estimated deadline
    let estimatedDeadline = subtask.earliestFinish || task.deadline;
    if (typeof estimatedDeadline === 'string') {
      estimatedDeadline = new Date(estimatedDeadline);
    }
    
    // Set estimated deadline to start of day
    const estimatedDeadlineDate = new Date(estimatedDeadline);
    estimatedDeadlineDate.setHours(0, 0, 0, 0);

    // Calculate soft deadline (1 day before estimated completion) - also start of day
    const softDeadlineDate = new Date(estimatedDeadlineDate);
    softDeadlineDate.setDate(softDeadlineDate.getDate() - 1);

    console.log(`⏰ Subtask "${subtask.name}": estimatedDeadline=${estimatedDeadlineDate.toDateString()}, softDeadline=${softDeadlineDate.toDateString()}, today=${today.toDateString()}`);

    // Add to database if deadlines are in the future and subtask is assigned
    if (subtask.assignedMember && subtask.status !== 'Completed') {
      if (softDeadlineDate >= today) {
        console.log(`📅 Creating soft deadline alert for subtask "${subtask.name}" scheduled for ${softDeadlineDate.toDateString()}`);
        await CronJob.create({
          alertType: 'subtask_soft_deadline',
          scheduledDate: softDeadlineDate,
          taskId: task._id,
          subtaskId: subtask._id,
          company: task.company,
          originalDeadline: estimatedDeadlineDate,
          metadata: {
            taskName: task.name,
            subtaskName: subtask.name,
            assignedMember: subtask.assignedMember
          }
        });
      } else {
        console.log(`⏰ Soft deadline for "${subtask.name}" is in the past (${softDeadlineDate.toDateString()}), skipping`);
      }

      if (estimatedDeadlineDate >= today) {
        console.log(`📅 Creating hard deadline alert for subtask "${subtask.name}" scheduled for ${estimatedDeadlineDate.toDateString()}`);
        await CronJob.create({
          alertType: 'subtask_hard_deadline',
          scheduledDate: estimatedDeadlineDate,
          taskId: task._id,
          subtaskId: subtask._id,
          company: task.company,
          originalDeadline: estimatedDeadlineDate,
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
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of day
      console.log(`🔍 Checking for due alerts on ${today.toDateString()}`);
      
      // Find all pending alerts scheduled for today or earlier
      const dueAlerts = await CronJob.find({
        status: 'pending',
        scheduledDate: { $lte: today }
      }).populate('taskId').populate('subtaskId');

      console.log(`🎯 Found ${dueAlerts.length} due alerts to process`);
      
      // Process each alert
      for (const cronJob of dueAlerts) {
        console.log(`📤 Processing alert: ${cronJob.alertType} for ${cronJob.taskId?.name || 'Unknown Task'} - scheduled for ${cronJob.scheduledDate.toDateString()}`);
        
        const alertResult = await this.processAlert(cronJob);
        
        // Mark with appropriate status based on whether alert was sent or skipped
        if (alertResult && alertResult.skipped) {
          cronJob.status = 'skipped';
          cronJob.processedAt = new Date();
          cronJob.skipReason = alertResult.reason;
          console.log(`⏭️ Alert skipped: ${alertResult.reason}`);
        } else {
          cronJob.status = 'processed';
          cronJob.processedAt = new Date();
          console.log(`✅ Alert processed successfully`);
        }
        
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
      if (!task) {
        console.log(`❌ No task found for cronJob ${cronJob._id}`);
        return { skipped: true, reason: 'Task not found' };
      }

      switch (cronJob.alertType) {
        case 'subtask_soft_deadline':
          if (!cronJob.subtaskId) {
            console.log(`❌ No subtask ID found for cronJob ${cronJob._id}`);
            return { skipped: true, reason: 'Subtask ID not found' };
          }
          
          // Fetch current subtask status (not the cached/populated one)
          const currentSubtask = await Subtask.findById(cronJob.subtaskId).populate('assignedMember');
          if (!currentSubtask) {
            console.log(`❌ Subtask ${cronJob.subtaskId} not found`);
            return { skipped: true, reason: 'Subtask not found' };
          }
          
          console.log(`🔔 Processing soft deadline for subtask "${currentSubtask.name}" (current status: ${currentSubtask.status})`);
          
          if (currentSubtask.status === 'Completed') {
            console.log(`✅ Subtask "${currentSubtask.name}" already completed - skipping notification`);
            return { skipped: true, reason: 'Subtask already completed' };
          } else {
            console.log(`📨 Sending soft deadline alert for "${currentSubtask.name}"`);
            await softDeadlineAlert(currentSubtask, task);
            return { skipped: false };
          }

        case 'subtask_hard_deadline':
          if (!cronJob.subtaskId) {
            console.log(`❌ No subtask ID found for cronJob ${cronJob._id}`);
            return { skipped: true, reason: 'Subtask ID not found' };
          }
          
          // Fetch current subtask status
          const currentHardSubtask = await Subtask.findById(cronJob.subtaskId).populate('assignedMember');
          if (!currentHardSubtask) {
            console.log(`❌ Subtask ${cronJob.subtaskId} not found`);
            return { skipped: true, reason: 'Subtask not found' };
          }
          
          console.log(`🔔 Processing hard deadline for subtask "${currentHardSubtask.name}" (current status: ${currentHardSubtask.status})`);
          
          if (currentHardSubtask.status === 'Completed') {
            console.log(`✅ Subtask "${currentHardSubtask.name}" already completed - skipping notification`);
            return { skipped: true, reason: 'Subtask already completed' };
          } else {
            console.log(`📨 Sending hard deadline alert for "${currentHardSubtask.name}"`);
            await hardDeadlineAlert(currentHardSubtask, task);
            return { skipped: false };
          }

        case 'task_hard_deadline':
          // Send hard deadline alert to manager (not to individual members)
          // This notifies manager that task deadline is reached/passed
          const User = (await import("../models/User.js")).default;
          const Member = (await import("../models/Member.js")).default;
          
          // Find manager in the company
          const manager = await Member.findOne({ 
            company: task.company,
            role: { $in: ['manager', 'superadmin'] }
          });
          
          if (manager) {
            const managerUser = await User.findOne({ member: manager._id });
            if (managerUser) {
              await managerEscalationAlert(null, task, managerUser);
              return { skipped: false };
            }
          }
          
          return { skipped: true, reason: 'No manager found' };

        default:
          console.log(`⚠️ Unknown alert type: ${cronJob.alertType}`);
          return { skipped: true, reason: 'Unknown alert type' };
      }
    } catch (error) {
      console.error(`❌ Error processing alert ${cronJob._id}:`, error);
      return { skipped: true, reason: `Error: ${error.message}` };
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
        .select('alertType scheduledDate taskId subtaskId metadata');

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
