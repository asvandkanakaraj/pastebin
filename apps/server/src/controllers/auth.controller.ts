import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service.js';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          error: 'BadRequestError',
          message: 'Email and password are required',
        });
      }

      const trimmedEmail = String(email).trim().toLowerCase();
      const trimmedPassword = String(password).trim();

      if (!trimmedEmail || !trimmedPassword) {
        return res.status(400).json({
          error: 'BadRequestError',
          message: 'Email and password cannot be empty or whitespaces',
        });
      }

      const user = await UserService.registerUser(trimmedEmail, trimmedPassword);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          error: 'BadRequestError',
          message: 'Email and password are required',
        });
      }

      const trimmedEmail = String(email).trim().toLowerCase();
      const trimmedPassword = String(password).trim();

      const result = await UserService.loginUser(trimmedEmail, trimmedPassword);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
