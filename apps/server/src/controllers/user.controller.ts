import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service.js';

export class UserController {
  static async getUserProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { username } = req.params;
      const profile = await UserService.getUserProfileByUsername(username);
      res.json(profile);
    } catch (error) {
      next(error);
    }
  }
}
