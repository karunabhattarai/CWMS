import express from 'express';
import { registerUser, loginUser, getAllUsers} from '../controllers/userController.js'
import authMiddleware from '../middleware/authMiddleware.js';
// import { registerManger, loginuser, getAllusers} from '../controllers/userController.js'

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/all',authMiddleware,getAllUsers);

export default router;
