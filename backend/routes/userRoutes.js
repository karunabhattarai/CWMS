import express from 'express';
import { registerSuperAdmin, registerManager, verifyUserEmail,loginUser, getAllUsers } from '../controllers/userController.js'
import authMiddleware from '../middleware/authMiddleware.js';
import allowRoles from '../middleware/roleMiddleware.js';


const router = express.Router();

router.post('/register/superadmin', registerSuperAdmin);
router.post('/register/manager', authMiddleware, allowRoles('superadmin'), registerManager); // Only allow superadmin to register manager
router.post('/login', loginUser);
router.get('/all',authMiddleware,getAllUsers);
router.get('/verify-email', verifyUserEmail); // Endpoint to verify user email

router.post(
    '/createManager',
    authMiddleware,
    // allowRoles('superadmin'), // Only allow superadmin
    allowRoles('superadmin', 'manager'), // Allow superadmin and manager
    registerManager
)

export default router;
