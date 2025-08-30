import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import dynamicCronService from '../services/cronService.js';
import CronJob from '../models/CronJob.js';
import Task from '../models/Task.js';
import Subtask from '../models/Subtask.js';

dotenv.config();

// Test script to manually trigger cron processing
async function testCronSystem() {
  try {
    // Connect to database
    await mongoose.connect(process.env.URI);
    console.log('✅ Connected to database');

    // Find your "Field Visit" task
    const fieldVisitTask = await Task.findOne({ name: /field visit/i }).populate('subtasks');
    
    if (fieldVisitTask) {
      console.log(`\n🎬 Found "Field Visit" task: ${fieldVisitTask.name}`);
      console.log(`Task ID: ${fieldVisitTask._id}`);
      console.log(`Deadline: ${fieldVisitTask.deadline}`);
      console.log(`Subtasks: ${fieldVisitTask.subtasks.length}`);
      
      // Show subtask details
      for (const subtask of fieldVisitTask.subtasks) {
        const subtaskDetail = await Subtask.findById(subtask).populate('assignedMember');
        console.log(`- ${subtaskDetail.name}: deadline=${subtaskDetail.earliestFinish || 'none'}, assigned=${subtaskDetail.assignedMember?.name || 'none'}`);
      }
      
      // Manually trigger cron update for this task
      console.log(`\n🔄 Manually updating cron list for task...`);
      await dynamicCronService.updateCronListForTask(fieldVisitTask._id);
      
    } else {
      console.log('\n❌ "Field Visit" task not found. Looking for all tasks...');
      const allTasks = await Task.find({}).sort({ createdAt: -1 }).limit(5);
      console.log('Recent tasks:');
      allTasks.forEach(task => {
        console.log(`- ${task.name} (${task._id}) - ${task.deadline}`);
      });
    }

    // Check CronJobs after update
    const allJobs = await CronJob.find({}).populate('taskId', 'name').populate('subtaskId', 'name');
    console.log(`\n📋 Total CronJobs in database: ${allJobs.length}`);
    
    allJobs.forEach(job => {
      console.log(`- ${job.alertType}: ${job.taskId?.name || 'Unknown'} / ${job.subtaskId?.name || 'N/A'} scheduled for ${job.scheduledDate} (status: ${job.status})`);
    });

    // Check for due alerts
    const now = new Date();
    const dueJobs = await CronJob.find({ 
      status: 'pending', 
      scheduledDate: { $lte: now }
    }).populate('taskId', 'name').populate('subtaskId', 'name');
    
    console.log(`\n🎯 Due alerts (should be processed): ${dueJobs.length}`);
    dueJobs.forEach(job => {
      console.log(`- ${job.alertType}: ${job.taskId?.name} / ${job.subtaskId?.name} was due at ${job.scheduledDate}`);
    });

    // Manually trigger cron processing
    console.log('\n🔄 Manually triggering cron processing...');
    await dynamicCronService.processScheduledAlerts();

    console.log('\n✅ Test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

testCronSystem();
