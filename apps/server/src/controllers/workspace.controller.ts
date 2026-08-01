import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { WorkspaceService } from '../services/workspace.service.js';

export class WorkspaceController {
  static async getWorkspace(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const workspace = await WorkspaceService.getUserWorkspace(userId);
      res.json(workspace);
    } catch (error) {
      next(error);
    }
  }
}
