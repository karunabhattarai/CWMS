import dynamicCronService from '../services/cronService.js';
import Subtask from '../models/Subtask.js';
import Task from '../models/Task.js';
import CronJob from '../models/CronJob.js';

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

    // Handle the response
    await dynamicCronService.handleSoftDeadlineResponse(subtaskId, canComplete);

    res.status(200).json({
      message: 'Response recorded successfully',
      canComplete,
      subtaskName: subtask.name
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

    const status = await dynamicCronService.getCronListStatus();
    res.status(200).json(status);

  } catch (error) {
    console.error('Error getting cron status:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};
