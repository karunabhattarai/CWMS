import express from 'express';
import { 
  handleSoftDeadlineResponse, 
  getCronStatus
} from '../controllers/deadlineController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import allowRoles from '../middleware/roleMiddleware.js';

const router = express.Router();

// Handle soft deadline response (user confirms if they can complete task)
router.post('/soft-deadline/:subtaskId/response', 
  authMiddleware, 
  handleSoftDeadlineResponse
);

// Get cron service status (managers only)
router.get('/cron-status', 
  authMiddleware, 
  allowRoles('superadmin', 'manager'), 
  getCronStatus
);

// Note: For completing subtasks (including via deadline alerts), 
// use the existing subtask routes: PUT /api/subtask/:id

export default router;
