import dynamicCronService from '../services/cronService.js';
import Subtask from '../models/Subtask.js';
import Task from '../models/Task.js';
import CronJob from '../models/CronJob.js';

export const checkResponseStatus = async (req, res) => {
  try {
    const { subtaskId } = req.params;

    // Verify subtask exists and user has permission
    const subtask = await Subtask.findById(subtaskId);
    if (!subtask) {
      return res.status(404).json({ message: 'Subtask not found' });
    }

    const task = await Task.findById(subtask.task);
    if (!task || task.company.toString() !== req.user.company.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if user has already responded to this deadline alert
    const existingResponse = await CronJob.findOne({
      subtaskId: subtaskId,
      alertType: 'subtask_soft_deadline',
      'userResponse.respondedBy': req.user._id,
      'userResponse.respondedAt': { $ne: null }
    });

    if (existingResponse) {
      const previousResponse = existingResponse.userResponse.canComplete ? 'Yes, I can complete' : 'No, I need help';
      return res.status(200).json({ 
        hasResponded: true,
        previousResponse: previousResponse,
        respondedAt: existingResponse.userResponse.respondedAt,
        canComplete: existingResponse.userResponse.canComplete
      });
    }

    res.status(200).json({ 
      hasResponded: false 
    });

  } catch (error) {
    console.error('Error checking response status:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};

export const handleSoftDeadlineResponse = async (req, res) => {
  try {
    const { subtaskId } = req.params;
    const { canComplete } = req.body;

    if (typeof canComplete !== 'boolean') {
      return res.status(400).json({ 
        message: 'canComplete must be a boolean value' 
      });
    }

    // Verify subtask exists and user has permission
    const subtask = await Subtask.findById(subtaskId).populate('assignedMember');
    if (!subtask) {
      return res.status(404).json({ message: 'Subtask not found' });
    }

    const task = await Task.findById(subtask.task);
    if (!task || task.company.toString() !== req.user.company.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if user is assigned to this subtask
    if (req.user.role === 'employee') {
      const isAssigned = subtask.assignedMember && subtask.assignedMember._id.toString() === req.user.member.toString();
      if (!isAssigned) {
        return res.status(403).json({ message: 'You are not assigned to this subtask' });
      }
    }

    // Check if user has already responded to this deadline alert
    const existingResponse = await CronJob.findOne({
      subtaskId: subtaskId,
      alertType: 'subtask_soft_deadline',
      'userResponse.respondedBy': req.user._id,
      'userResponse.respondedAt': { $ne: null }
    });

    if (existingResponse) {
      const previousResponse = existingResponse.userResponse.canComplete ? 'Yes, I can complete' : 'No, I need help';
      return res.status(409).json({ 
        message: 'You have already responded to this deadline alert',
        previousResponse: previousResponse,
        respondedAt: existingResponse.userResponse.respondedAt
      });
    }

    // Find the pending soft deadline CronJob for this subtask
    const cronJob = await CronJob.findOne({
      subtaskId: subtaskId,
      alertType: 'subtask_soft_deadline',
      status: { $in: ['pending', 'processed'] }
    });

    if (cronJob) {
      // Record the user response
      cronJob.userResponse = {
        canComplete: canComplete,
        respondedAt: new Date(),
        respondedBy: req.user._id
      };
      await cronJob.save();
      console.log(`📝 User response recorded: ${req.user.email} - ${canComplete ? 'Can complete' : 'Cannot complete'} - Subtask: ${subtask.name}`);
    }

    // Handle the response (escalation if needed)
    await dynamicCronService.handleSoftDeadlineResponse(subtaskId, canComplete);

    res.status(200).json({
      message: 'Response recorded successfully',
      canComplete,
      subtaskName: subtask.name,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Error handling soft deadline response:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};

export const getCronStatus = async (req, res) => {
  try {
    // Only allow managers and superadmins to view cron status
    if (!['manager', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get all pending CronJobs for this company
    const pendingJobs = await CronJob.find({
      status: 'pending',
      company: req.user.company
    })
    .populate('taskId', 'name deadline')
    .populate('subtaskId', 'name status assignedMember')
    .sort({ scheduledDate: 1 });

    // Get recently processed jobs (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const processedJobs = await CronJob.find({
      status: 'processed',
      company: req.user.company,
      processedAt: { $gte: yesterday }
    })
    .populate('taskId', 'name')
    .populate('subtaskId', 'name')
    .sort({ processedAt: -1 })
    .limit(20);

    // Get recently skipped jobs (last 24 hours)
    const skippedJobs = await CronJob.find({
      status: 'skipped',
      company: req.user.company,
      processedAt: { $gte: yesterday }
    })
    .populate('taskId', 'name')
    .populate('subtaskId', 'name')
    .sort({ processedAt: -1 })
    .limit(20);

    // Simple response with raw CronJob data
    res.status(200).json({
      pending: pendingJobs,
      recentlyProcessed: processedJobs,
      recentlySkipped: skippedJobs,
      summary: {
        totalPending: pendingJobs.length,
        totalProcessedLast24h: processedJobs.length,
        totalSkippedLast24h: skippedJobs.length
      }
    });

  } catch (error) {
    console.error('Error getting cron status:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};

export const deleteCronJobs = async (req, res) => {
  try {
    // Only allow superadmins to delete all cron jobs
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied. Only superadmins can delete all cron jobs.' });
    }

    console.log('🗑️ Deleting all CronJobs and cleaning up indexes...');
    
    // Count before deletion
    const beforeCount = await CronJob.countDocuments({});
    
    // Delete all CronJobs
    const result = await CronJob.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} CronJobs`);
    
    // Drop the problematic cronId index if it exists
    try {
      await CronJob.collection.dropIndex('cronId_1');
      console.log('✅ Dropped cronId_1 index');
    } catch (indexError) {
      if (indexError.code === 27) {
        console.log('ℹ️ cronId_1 index does not exist (already clean)');
      } else {
        console.log('⚠️ Could not drop cronId_1 index:', indexError.message);
      }
    }

    res.status(200).json({
      message: 'All CronJobs deleted successfully and indexes cleaned',
      deletedCount: result.deletedCount,
      beforeCount
    });

  } catch (error) {
    console.error('Error deleting all cron jobs:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};

export const scanAllTasks = async (req, res) => {
  try {
    // Only allow managers and superadmins to trigger task scan
    if (!['manager', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Only managers and superadmins can trigger task scan.' });
    }

    console.log('🔍 Manual task scan triggered...');
    
    // Trigger the comprehensive task scan
    await dynamicCronService.scanAllTasksForCronJobs();
    
    // Get updated counts
    const totalTasks = await Task.countDocuments({ status: { $nin: ['Completed', 'Cancelled'] } });
    const totalCronJobs = await CronJob.countDocuments({});
    
    res.status(200).json({
      message: 'Task scan completed successfully',
      totalActiveTasks: totalTasks,
      totalCronJobs: totalCronJobs,
      triggeredBy: req.user.email,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error during manual task scan:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};
