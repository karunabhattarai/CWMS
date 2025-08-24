import express from 'express';
import { registerUser, verifyUserEmail,loginUser, getAllUsers,getUserById,deleteUser,updateUser,changePassword, requestPasswordReset,resetPassword } from '../controllers/userController.js'
import authMiddleware from '../middleware/authMiddleware.js';
import allowRoles from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/register', async (req, res, next) => {
  const { role } = req.body;

  if (role === 'superadmin') {
    // Allow superadmin registration without auth
    return registerUser(req, res);
  } else {
    // Manager/Employee requires authentication and superadmin|manager role
    return authMiddleware(req, res, () =>
      allowRoles('superadmin', 'manager')(req, res, () => registerUser(req, res))
    );
  }
});

router.get('/verify-email', verifyUserEmail); // Endpoint to verify user email
router.post('/login', loginUser);

router.post('/change-password', authMiddleware, changePassword);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);


router.get('/all',authMiddleware,allowRoles('superadmin', 'manager'),getAllUsers);
// keep dynamic links later | natra anything after /string ganxa ani auth ma pathauxa lol 
router.get('/:id',authMiddleware, getUserById);
router.put('/:id',authMiddleware, allowRoles('superadmin', 'manager'), updateUser); // Allow superadmin and manager to update user
router.delete('/:id',authMiddleware,allowRoles('superadmin'), deleteUser); // Only allow superadmin to delete user

export default router;
