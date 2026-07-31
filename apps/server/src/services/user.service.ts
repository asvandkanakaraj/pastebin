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

    // Derive a unique username from email prefix
    let username = email
      .split('@')[0]
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '');
    if (!username) {
      username = 'user_' + Math.random().toString(36).substring(2, 8);
    }

    let existingUsername = await db.user.findUnique({
      where: { username },
    });
    let suffix = 1;
    const baseUsername = username;
    while (existingUsername) {
      username = `${baseUsername}${suffix}`;
      existingUsername = await db.user.findUnique({
        where: { username },
      });
      suffix++;
    }

    const passwordHash = await bcrypt.hash(passwordInput, 10);
    const user = await db.user.create({
      data: {
        email,
        username,
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
      { userId: user.id, email: user.email, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { passwordHash: _, ...safeUser } = user;
    return {
      user: safeUser,
      token,
    };
  }

  static async getUserProfileByUsername(username: string) {
    const user = await db.user.findUnique({
      where: { username },
    });

    if (!user) {
      const error = new Error('User not found');
      (error as any).status = 404;
      (error as any).name = 'NotFoundError';
      throw error;
    }

    const pastes = await db.paste.findMany({
      where: {
        userId: user.id,
        isPublic: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        language: true,
        createdAt: true,
        expiresAt: true,
        isPublic: true,
      },
    });

    const { passwordHash: _, ...safeUser } = user;
    return {
      user: safeUser,
      pastes,
    };
  }
}
