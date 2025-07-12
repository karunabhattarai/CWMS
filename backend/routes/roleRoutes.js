import express from 'express';
import { createRole, getAllRoles, updateRole, deleteRole } from '../controllers/roleController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import allowRoles from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, allowRoles('superadmin', 'manager'), createRole);
router.get('/', authMiddleware, allowRoles('superadmin', 'manager'), getAllRoles);
router.put('/:id', authMiddleware, allowRoles('superadmin', 'manager'), updateRole);
router.delete('/:id', authMiddleware, allowRoles('superadmin', 'manager'), deleteRole);

export default router;
