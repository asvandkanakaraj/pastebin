import { Router } from 'express';
import { PasteController } from '../controllers/paste.controller.js';
import { deleteRateLimiter } from '../middleware/rate-limit.middleware.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/', optionalAuthMiddleware, PasteController.createPaste);
router.get('/', PasteController.listPastes);
router.get('/me', authMiddleware, PasteController.getMyPastes);
router.get('/:id', PasteController.getPaste);
router.delete('/:id', deleteRateLimiter, PasteController.deletePaste);

export default router;
