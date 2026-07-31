import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '@pastebin/database';

const JWT_SECRET = process.env.JWT_SECRET || 'pastebin-super-secret-key-development';

export class UserService {
  static async registerUser(email: string, passwordInput: string) {
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      const error = new Error('Email is already registered');
      (error as any).status = 400;
      (error as any).name = 'BadRequestError';
      throw error;
    }

    const passwordHash = await bcrypt.hash(passwordInput, 10);
    const user = await db.user.create({
      data: {
        email,
        passwordHash,
      },
    });

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  static async loginUser(email: string, passwordInput: string) {
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      const error = new Error('Invalid email or password');
      (error as any).status = 401;
      (error as any).name = 'UnauthorizedError';
      throw error;
    }

    const isMatch = await bcrypt.compare(passwordInput, user.passwordHash);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      (error as any).status = 401;
      (error as any).name = 'UnauthorizedError';
      throw error;
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { passwordHash: _, ...safeUser } = user;
    return {
      user: safeUser,
      token,
    };
  }
}
