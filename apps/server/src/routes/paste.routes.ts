import { Router } from 'express';
import { PasteController } from '../controllers/paste.controller.js';
import { deleteRateLimiter, strictRateLimiter } from '../middleware/rate-limit.middleware.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.middleware.js';
import { sanitizeMiddleware } from '../middleware/sanitize.middleware.js';

const router = Router();

router.post(
  '/',
  strictRateLimiter,
  optionalAuthMiddleware,
  sanitizeMiddleware,
  PasteController.createPaste
);
router.get('/', PasteController.listPastes);
router.get('/me', authMiddleware, PasteController.getMyPastes);
router.get('/:id', optionalAuthMiddleware, PasteController.getPaste);
router.post('/:id/verify', PasteController.verifyPassword);
router.delete('/:id', deleteRateLimiter, PasteController.deletePaste);

export default router;
