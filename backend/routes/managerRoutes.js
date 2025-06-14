import express from 'express';
import { registerManager, loginManager, getAllManagers} from '../controllers/managerController.js'
import authMiddleware from '../middleware/authMiddleware.js';
// import { registerManger, loginManager, getAllManagers} from '../controllers/managerController.js'

const router = express.Router();

router.post('/register', registerManager);
router.post('/login', loginManager);
router.get('/all',authMiddleware,getAllManagers);

export default router;
