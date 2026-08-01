import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service.js';
import { RegisterSchema, LoginSchema } from '@pastebin/shared';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = RegisterSchema.parse(req.body);
      const user = await UserService.registerUser(validatedData.email, validatedData.password);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = LoginSchema.parse(req.body);
      const result = await UserService.loginUser(validatedData.email, validatedData.password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
