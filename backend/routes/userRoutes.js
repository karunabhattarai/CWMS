import express from 'express';
import { registerSuperAdmin, registerManager, verifyUserEmail,loginUser, getAllUsers,getUserById,deleteUser,updateUser,changePassword, requestPasswordReset,resetPassword } from '../controllers/userController.js'
import authMiddleware from '../middleware/authMiddleware.js';
import allowRoles from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/register/superadmin', registerSuperAdmin);
router.get('/verify-email', verifyUserEmail); // Endpoint to verify user email
router.post('/register/manager', authMiddleware, allowRoles('superadmin'), registerManager); // Only allow superadmin to register manager
router.post('/login', loginUser);
router.get('/all',authMiddleware,getAllUsers);

router.post('/change-password', authMiddleware, changePassword);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);


// keep dynamic links later | natra anything after /string ganxa ani auth ma pathauxa lol 
router.get('/:id',authMiddleware, getUserById);
router.put('/:id',authMiddleware, allowRoles('superadmin', 'manager'), updateUser); // Allow superadmin and manager to update user
router.delete('/:id',authMiddleware,allowRoles('superadmin'), deleteUser); // Only allow superadmin to delete user


router.post(
    '/createManager',
    authMiddleware,
    // allowRoles('superadmin'), // Only allow superadmin
    allowRoles('superadmin', 'manager'), // Allow superadmin and manager
    registerManager
)

export default router;
