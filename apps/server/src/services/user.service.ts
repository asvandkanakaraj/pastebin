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

  static async getUserProfileByUsername(username: string, requestingUserId?: string) {
    const lowercaseUsername = username.toLowerCase();
    let user = await db.user.findUnique({
      where: { username: lowercaseUsername },
    });

    if (!user && lowercaseUsername.includes('@')) {
      user = await db.user.findUnique({
        where: { email: lowercaseUsername },
      });
    }

    if (!user) {
      const error = new Error('User not found');
      (error as any).status = 404;
      (error as any).name = 'NotFoundError';
      throw error;
    }

    const isOwner = requestingUserId && user.id === requestingUserId;

    let pastes: any[] = [];
    let saved: any[] = [];
    let recent: any[] = [];
    let stats: any = {};

    if (isOwner) {
      // Owner sees all their pastes (Public, Private, Secret)
      const rawPastes = await db.paste.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      });
      pastes = rawPastes.map(({ passwordHash, ...p }) => ({
        ...p,
        hasPassword: passwordHash !== null,
      }));

      // Owner sees their saved pastes (bookmarks)
      const savedPastes = await db.savedPaste.findMany({
        where: { userId: user.id },
        include: {
          paste: {
            include: {
              user: {
                select: {
                  username: true,
                  displayName: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
        orderBy: { id: 'desc' },
      });
      saved = savedPastes.map((s) => s.paste).filter((p) => p !== null);

      // Owner sees their recently viewed pastes (last 5)
      const recentViews = await db.recentView.findMany({
        where: { userId: user.id },
        include: {
          paste: {
            include: {
              user: {
                select: {
                  username: true,
                  displayName: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
        orderBy: { viewedAt: 'desc' },
        take: 5,
      });
      recent = recentViews.map((r) => r.paste).filter((p) => p !== null);

      // Complete statistics for owner
      const totalPastes = await db.paste.count({ where: { userId: user.id } });
      const publicPastes = await db.paste.count({
        where: { userId: user.id, visibility: 'PUBLIC' },
      });
      const privatePastes = await db.paste.count({
        where: { userId: user.id, visibility: 'PRIVATE' },
      });
      const secretPastes = await db.paste.count({
        where: { userId: user.id, visibility: 'SECRET' },
      });
      const savedPastesCount = await db.savedPaste.count({ where: { userId: user.id } });

      stats = {
        totalPastes,
        publicPastes,
        privatePastes,
        secretPastes,
        savedPastes: savedPastesCount,
      };
    } else {
      // Everyone (guests and logged-in visitors) sees PUBLIC + PRIVATE pastes.
      // SECRET pastes are always owner-only.
      // Private paste CONTENT is PIN-gated at the view route.
      const condition = {
        userId: user.id,
        visibility: { in: ['PUBLIC', 'PRIVATE'] },
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      };

      const rawVisitorPastes = await db.paste.findMany({
        where: condition,
        orderBy: { createdAt: 'desc' },
      });
      pastes = rawVisitorPastes.map(({ passwordHash, ...p }) => ({
        ...p,
        hasPassword: passwordHash !== null,
      }));

      // Visitor stats: total visible pastes + public count only
      const publicPastes = await db.paste.count({
        where: { userId: user.id, visibility: 'PUBLIC' },
      });

      stats = {
        totalPastes: pastes.length,
        publicPastes,
      };
    }

    const { passwordHash: _, ...safeUser } = user;
    return {
      user: safeUser,
      pastes,
      saved,
      recent,
      stats,
    };
  }

  static async checkUsernameAvailability(username: string) {
    const trimmed = username.trim().toLowerCase();
    const regex = /^[a-z0-9_]{3,20}$/;
    if (!regex.test(trimmed)) {
      return {
        available: false,
        error: 'Username must be 3-20 characters, lowercase alphanumeric or underscores',
      };
    }

    const user = await db.user.findUnique({
      where: { username: trimmed },
    });

    return { available: !user };
  }

  static async updateUserProfile(
    userId: string,
    data: {
      displayName?: string;
      username?: string;
      email?: string;
      bio?: string;
      avatarUrl?: string | null;
    }
  ) {
    const updateData: any = {};

    if (data.displayName !== undefined) {
      if (data.displayName && data.displayName.length > 50) {
        const error = new Error('Display Name must be under 50 characters');
        (error as any).status = 400;
        throw error;
      }
      updateData.displayName = data.displayName || null;
    }

    if (data.username !== undefined) {
      const trimmedUsername = data.username.trim().toLowerCase();
      const regex = /^[a-z0-9_]{3,20}$/;
      if (!regex.test(trimmedUsername)) {
        const error = new Error(
          'Username must be 3-20 characters, lowercase alphanumeric or underscores'
        );
        (error as any).status = 400;
        throw error;
      }

      const existing = await db.user.findFirst({
        where: { username: trimmedUsername, NOT: { id: userId } },
      });
      if (existing) {
        const error = new Error('Username already taken');
        (error as any).status = 400;
        throw error;
      }
      updateData.username = trimmedUsername;
    }

    if (data.email !== undefined) {
      const trimmedEmail = data.email.trim();
      const existing = await db.user.findFirst({
        where: { email: trimmedEmail, NOT: { id: userId } },
      });
      if (existing) {
        const error = new Error('Email is already registered');
        (error as any).status = 400;
        throw error;
      }
      updateData.email = trimmedEmail;
    }

    if (data.bio !== undefined) {
      if (data.bio && data.bio.length > 150) {
        const error = new Error('Bio must be under 150 characters');
        (error as any).status = 400;
        throw error;
      }
      updateData.bio = data.bio || null;
    }

    if (data.avatarUrl !== undefined) {
      updateData.avatarUrl = data.avatarUrl;
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updateData,
    });

    const { passwordHash: _, ...safeUser } = updatedUser;
    return safeUser;
  }
}
