import { Router } from 'express';
import { WorkspaceController } from '../controllers/workspace.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authMiddleware, WorkspaceController.getWorkspace);

export default router;
