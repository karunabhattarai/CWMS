import express from 'express';
import { 
  handleSoftDeadlineResponse, 
  checkResponseStatus,
  getCronStatus,
  deleteCronJobs,
  scanAllTasks
} from '../controllers/deadlineController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import allowRoles from '../middleware/roleMiddleware.js';

const router = express.Router();

// Check if user has already responded to deadline alert
router.get('/response-status/:subtaskId', 
  authMiddleware, 
  checkResponseStatus
);

// Handle soft deadline response (user confirms if they can complete task)
router.post('/soft-deadline-response/:subtaskId', 
  authMiddleware, 
  handleSoftDeadlineResponse
);

// Get cron service status (managers only)
router.get('/cron-status', 
  authMiddleware, 
  allowRoles('superadmin', 'manager'), 
  getCronStatus
);

// Delete all CronJobs (superadmin/manager only - for testing/cleanup)
router.delete('/delete-cronjobs', 
  authMiddleware, 
  allowRoles('superadmin', 'manager'), 
  deleteCronJobs
);

// Manually trigger comprehensive task scan (managers only)
router.get('/scan-all-tasks', 
  authMiddleware, 
  allowRoles('superadmin', 'manager'), 
  scanAllTasks
);

// Note: For completing subtasks (including via deadline alerts), 
// use the existing subtask routes: PUT /api/subtask/:id

export default router;
