import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import allowRoles from '../middleware/roleMiddleware.js';
import {
  createSubtaskTemplate,
  getAllSubtaskTemplates,
  updateSubtaskTemplate,
  deleteSubtaskTemplate
} from '../controllers/subtaskTemplateController.js';

const router = express.Router();

router.use(authMiddleware, allowRoles('superadmin', 'manager'));

router.post('/', createSubtaskTemplate);
router.get('/', getAllSubtaskTemplates);
router.put('/:id', updateSubtaskTemplate);
router.delete('/:id', deleteSubtaskTemplate);

export default router;
