import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { strictRateLimiter } from '../middleware/rate-limit.middleware.js';

const router = Router();

router.post('/register', strictRateLimiter, AuthController.register);
router.post('/login', strictRateLimiter, AuthController.login);

export default router;
