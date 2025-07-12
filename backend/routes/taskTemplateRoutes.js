import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import allowRoles from '../middleware/roleMiddleware.js';
import {
  createTaskTemplate,
  getAllTaskTemplates,
  updateTaskTemplate,
  deleteTaskTemplate
} from '../controllers/taskTemplateController.js';

const router = express.Router();

router.use(authMiddleware, allowRoles('superadmin', 'manager'));

router.post('/', createTaskTemplate);
router.get('/', getAllTaskTemplates);
router.put('/:id', updateTaskTemplate);
router.delete('/:id', deleteTaskTemplate);

export default router;
