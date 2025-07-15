import express from 'express';
import { scheduleTask } from '../controllers/schedulingController.js';

const router = express.Router();

router.post('/:taskId', scheduleTask);

export default router;
