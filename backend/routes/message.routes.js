import { Router } from 'express';
import * as messageController from '../controllers/message.controller.js';
import { authUser } from '../middleware/auth.middleware.js';

const router = Router();

// Get all messages for a project
router.get('/project/:projectId', authUser, messageController.getProjectMessages);

export default router;