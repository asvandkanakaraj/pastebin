import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/check-username', UserController.checkUsernameAvailability);
router.put('/profile', authMiddleware, UserController.updateUserProfile);
router.get('/:username', optionalAuthMiddleware, UserController.getUserProfile);

export default router;
