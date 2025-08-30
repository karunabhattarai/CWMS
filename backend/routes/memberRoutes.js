import express from 'express';
import { createMember, getAllMembers, getAllOccupiedMembers, updateMember, deleteMember } from '../controllers/memberController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import allowRoles from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, allowRoles('superadmin', 'manager'), createMember);
router.get('/', authMiddleware, allowRoles('superadmin', 'manager'), getAllMembers);
router.get('/occupied', authMiddleware, allowRoles('superadmin', 'manager'), getAllOccupiedMembers);
router.put('/:id', authMiddleware, allowRoles('superadmin', 'manager'), updateMember);
router.delete('/:id', authMiddleware, allowRoles('superadmin', 'manager'), deleteMember);

export default router;