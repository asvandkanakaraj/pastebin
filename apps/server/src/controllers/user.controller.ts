import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service.js';

export class UserController {
  static async getUserProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { username } = req.params;
      const requestingUserId = (req as any).user?.userId;
      const profile = await UserService.getUserProfileByUsername(username, requestingUserId);
      res.json(profile);
    } catch (error) {
      next(error);
    }
  }

  static async checkUsernameAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const { username } = req.query;
      if (typeof username !== 'string') {
        res.status(400).json({ error: 'Username query parameter is required' });
        return;
      }
      const result = await UserService.checkUsernameAvailability(username);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async updateUserProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const updatedUser = await UserService.updateUserProfile(userId, req.body);
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  }
}
