import { db } from '@pastebin/database';
import bcrypt from 'bcrypt';

export class PasteService {
  static async createPaste(data: {
    title?: string;
    description?: string;
    content: string;
    language?: string;
    visibility?: string;
    isPublic?: boolean;
    password?: string;
    expiresInSeconds?: number;
    userId?: string;
    shares?: Array<{ userId: string; permission: 'READ' | 'WRITE' }>;
  }) {
    const isGuest = !data.userId;

    let passwordHash: string | null = null;
    if (data.password && !isGuest) {
      passwordHash = await bcrypt.hash(data.password, 10);
    }

    let expiresAt: Date | undefined = undefined;
    if (isGuest) {
      // Guest pastes always expire after exactly 1 hour
      expiresAt = new Date(Date.now() + 3600 * 1000);
    } else if (data.expiresInSeconds) {
      expiresAt = new Date(Date.now() + data.expiresInSeconds * 1000);
    }

    const visibility = isGuest ? 'PUBLIC' : (data.visibility || (data.isPublic === false ? 'PRIVATE' : 'PUBLIC'));
    const isPublic = visibility === 'PUBLIC';

    return await db.$transaction(async (tx) => {
      // Generate unique 8-character uppercase alphanumeric ID
      let pasteId = '';
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let isUnique = false;
      while (!isUnique) {
        pasteId = '';
        for (let i = 0; i < 8; i++) {
          pasteId += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        const existing = await tx.paste.findUnique({ where: { id: pasteId } });
        if (!existing) {
          isUnique = true;
        }
      }

      const paste = await tx.paste.create({
        data: {
          id: pasteId,
          title: data.title,
          description: data.description,
          content: data.content,
          language: data.language || 'plaintext',
          visibility,
          isPublic,
          passwordHash,
          expiresAt,
          userId: data.userId || null,
        },
      });

      if (!isGuest && data.shares && Array.isArray(data.shares)) {
        await tx.share.createMany({
          data: data.shares.map((s: any) => ({
            pasteId: paste.id,
            userId: s.userId,
            permission: s.permission || 'READ',
          })),
        });
      }

      return paste;
    });
  }

  static async getPasteById(id: string, passwordInput?: string, requestingUserId?: string) {
    const paste = await db.paste.findUnique({
      where: { id },
    });

    if (!paste) {
      const error = new Error('Paste not found');
      (error as any).status = 404;
      (error as any).name = 'NotFoundError';
      throw error;
    }

    // Expiration check
    if (paste.expiresAt && paste.expiresAt < new Date()) {
      const error = new Error('Paste has expired');
      (error as any).status = 410; // Gone / Expired
      (error as any).name = 'ExpiredError';
      throw error;
    }

    // Privacy checks
    if (paste.visibility === 'ONLY_ME' || paste.visibility === 'SECRET') {
      if (!requestingUserId || paste.userId !== requestingUserId) {
        const error = new Error('Access denied. Only the owner can view this paste.');
        (error as any).status = 403;
        (error as any).name = 'ForbiddenError';
        throw error;
      }
    } else if (!paste.isPublic && paste.userId !== requestingUserId) {
      // If it is private, require password verification for non-owners
      if (paste.passwordHash) {
        if (!passwordInput) {
          const error = new Error('Password required to view this paste');
          (error as any).status = 401;
          (error as any).name = 'UnauthorizedError';
          throw error;
        }
        const isMatch = await bcrypt.compare(passwordInput, paste.passwordHash);
        if (!isMatch) {
          const error = new Error('Incorrect password');
          (error as any).status = 403;
          (error as any).name = 'ForbiddenError';
          throw error;
        }
      } else {
        const error = new Error('Access denied to private paste');
        (error as any).status = 403;
        (error as any).name = 'ForbiddenError';
        throw error;
      }
    }

    // Password check bypass for owner (if they are logged in, they don't need to verify PIN)
    if (paste.passwordHash && paste.userId !== requestingUserId) {
      if (!passwordInput) {
        const error = new Error('Password required to view this paste');
        (error as any).status = 401;
        (error as any).name = 'UnauthorizedError';
        throw error;
      }
      const isMatch = await bcrypt.compare(passwordInput, paste.passwordHash);
      if (!isMatch) {
        const error = new Error('Incorrect password');
        (error as any).status = 403;
        (error as any).name = 'ForbiddenError';
        throw error;
      }
    }

    // Exclude passwordHash from returned object
    const { passwordHash, ...safePaste } = paste;

    // Log recent view in background if user is authenticated
    if (requestingUserId) {
      db.recentView
        .upsert({
          where: {
            pasteId_userId: {
              pasteId: id,
              userId: requestingUserId,
            },
          },
          create: {
            pasteId: id,
            userId: requestingUserId,
          },
          update: {
            viewedAt: new Date(),
          },
        })
        .then(async () => {
          const views = await db.recentView.findMany({
            where: { userId: requestingUserId },
            orderBy: { viewedAt: 'desc' },
          });
          if (views.length > 5) {
            const toDelete = views.slice(5).map((v) => v.id);
            await db.recentView.deleteMany({
              where: { id: { in: toDelete } },
            });
          }
        })
        .catch((err) => console.error('Failed to log recent view:', err));
    }

    let isSaved = false;
    let sharePermission: string | null = null;
    if (requestingUserId) {
      const share = await db.share.findFirst({
        where: {
          pasteId: id,
          userId: requestingUserId,
        },
      });
      if (share) {
        sharePermission = share.permission;
      }
      const saved = await db.savedPaste.findUnique({
        where: {
          pasteId_userId: {
            pasteId: id,
            userId: requestingUserId,
          },
        },
      });
      isSaved = !!saved;
    }

    return {
      ...safePaste,
      sharePermission,
      isSaved,
      hasPassword: passwordHash !== null,
    };
  }

  static async verifyPastePassword(id: string, passwordInput: string) {
    const paste = await db.paste.findUnique({
      where: { id },
    });

    if (!paste) {
      const error = new Error('Paste not found');
      (error as any).status = 404;
      (error as any).name = 'NotFoundError';
      throw error;
    }

    if (!paste.passwordHash) {
      return { success: true };
    }

    const isMatch = await bcrypt.compare(passwordInput, paste.passwordHash);
    if (!isMatch) {
      const error = new Error('Incorrect password');
      (error as any).status = 403;
      (error as any).name = 'ForbiddenError';
      throw error;
    }

    return { success: true };
  }

  static async listPublicPastes(page = 1, limit = 10, search?: string, language?: string) {
    const skip = (page - 1) * limit;

    const whereClause: any = {
      isPublic: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    };

    if (language) {
      whereClause.language = language;
    }

    if (search) {
      whereClause.AND = [
        {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { id: { equals: search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    const [pastes, totalCount] = await Promise.all([
      db.paste.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.paste.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const safePastes = pastes.map(({ passwordHash, ...safePaste }) => ({
      ...safePaste,
      hasPassword: passwordHash !== null,
    }));

    return {
      pastes: safePastes,
      totalCount,
      totalPages,
      currentPage: page,
    };
  }

  static async listUserPastes(userId: string) {
    const pastes = await db.paste.findMany({
      where: {
        userId,
      },
      orderBy: { createdAt: 'desc' },
    });

    return pastes.map(({ passwordHash, ...safePaste }) => ({
      ...safePaste,
      hasPassword: passwordHash !== null,
    }));
  }

  static async deletePaste(id: string, passwordInput?: string, requestingUserId?: string) {
    const paste = await db.paste.findUnique({
      where: { id },
    });

    if (!paste) {
      const error = new Error('Paste not found');
      (error as any).status = 404;
      (error as any).name = 'NotFoundError';
      throw error;
    }

    // Guest pastes cannot be deleted
    if (!paste.userId) {
      const error = new Error('Access denied. Guest pastes cannot be deleted; they will expire automatically after 1 hour.');
      (error as any).status = 403;
      (error as any).name = 'ForbiddenError';
      throw error;
    }

    // Ownership check: if the paste belongs to a registered user, only that user can delete it
    if (paste.userId !== requestingUserId) {
      const error = new Error('Access denied. You do not own this paste.');
      (error as any).status = 403;
      (error as any).name = 'ForbiddenError';
      throw error;
    }


    await db.paste.delete({
      where: { id },
    });

    return { success: true };
  }

  static async updatePaste(id: string, requestingUserId: string, data: any) {
    const paste = await db.paste.findUnique({
      where: { id },
    });

    if (!paste) {
      const error = new Error('Paste not found');
      (error as any).status = 404;
      (error as any).name = 'NotFoundError';
      throw error;
    }

    // Guest pastes cannot be edited
    if (!paste.userId) {
      const error = new Error('Access denied. Guest pastes cannot be edited.');
      (error as any).status = 403;
      (error as any).name = 'ForbiddenError';
      throw error;
    }

    const isOwner = paste.userId === requestingUserId;

    // If not the owner, check if the paste was shared with the user with WRITE permission
    if (!isOwner) {
      const share = await db.share.findUnique({
        where: {
          pasteId_userId: {
            pasteId: id,
            userId: requestingUserId,
          },
        },
      });

      if (!share || share.permission !== 'WRITE') {
        const error = new Error('Access denied. You do not have write permission for this paste.');
        (error as any).status = 403;
        (error as any).name = 'ForbiddenError';
        throw error;
      }
    }

    // Prepare update data
    const updateData: any = {};

    if (isOwner) {
      // Owner can update all fields
      updateData.title = data.title;
      updateData.description = data.description;
      updateData.content = data.content;
      updateData.language = data.language;

      const visibility = data.visibility || (data.isPublic === false ? 'PRIVATE' : 'PUBLIC');
      updateData.visibility = visibility;
      updateData.isPublic = visibility === 'PUBLIC';

      if (data.password !== undefined) {
        if (data.password === '') {
          updateData.passwordHash = null;
        } else {
          updateData.passwordHash = await bcrypt.hash(data.password, 10);
        }
      }
    } else {
      // Shared WRITE user can only update content, title, language, and description
      updateData.title = data.title;
      updateData.description = data.description;
      updateData.content = data.content;
      updateData.language = data.language;
    }

    return await db.paste.update({
      where: { id },
      data: updateData,
    });
  }

  static async sharePaste(
    id: string,
    requestingUserId: string,
    usernameOrEmail: string,
    permission: 'READ' | 'WRITE' = 'READ'
  ) {
    const paste = await db.paste.findUnique({
      where: { id },
    });

    if (!paste) {
      const error = new Error('Paste not found');
      (error as any).status = 404;
      (error as any).name = 'NotFoundError';
      throw error;
    }

    if (paste.userId !== requestingUserId) {
      const error = new Error('Access denied. You do not own this paste.');
      (error as any).status = 403;
      (error as any).name = 'ForbiddenError';
      throw error;
    }

    // Find target user by username or email
    const targetUser = await db.user.findFirst({
      where: {
        OR: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
      },
    });

    if (!targetUser) {
      const error = new Error('User not found');
      (error as any).status = 404;
      (error as any).name = 'NotFoundError';
      throw error;
    }

    if (targetUser.id === requestingUserId) {
      const error = new Error('You cannot share a paste with yourself');
      (error as any).status = 400;
      (error as any).name = 'BadRequestError';
      throw error;
    }

    return await db.share.upsert({
      where: {
        pasteId_userId: {
          pasteId: id,
          userId: targetUser.id,
        },
      },
      create: {
        pasteId: id,
        userId: targetUser.id,
        permission,
      },
      update: {
        permission,
      },
    });
  }

  static async getPasteShares(id: string, requestingUserId: string) {
    const paste = await db.paste.findUnique({
      where: { id },
    });

    if (!paste) {
      const error = new Error('Paste not found');
      (error as any).status = 404;
      (error as any).name = 'NotFoundError';
      throw error;
    }

    if (paste.userId !== requestingUserId) {
      const error = new Error('Access denied. You do not own this paste.');
      (error as any).status = 403;
      (error as any).name = 'ForbiddenError';
      throw error;
    }

    return await db.share.findMany({
      where: { pasteId: id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });
  }

  static async removePasteShare(id: string, requestingUserId: string, targetUserId: string) {
    const paste = await db.paste.findUnique({
      where: { id },
    });

    if (!paste) {
      const error = new Error('Paste not found');
      (error as any).status = 404;
      (error as any).name = 'NotFoundError';
      throw error;
    }

    if (paste.userId !== requestingUserId) {
      const error = new Error('Access denied. You do not own this paste.');
      (error as any).status = 403;
      (error as any).name = 'ForbiddenError';
      throw error;
    }

    await db.share.delete({
      where: {
        pasteId_userId: {
          pasteId: id,
          userId: targetUserId,
        },
      },
    });

    return { success: true };
  }

  static async savePaste(id: string, userId: string) {
    const paste = await db.paste.findUnique({
      where: { id },
      include: {
        shares: {
          where: { userId },
        },
      },
    });

    if (!paste) {
      const error = new Error('Paste not found');
      (error as any).status = 404;
      (error as any).name = 'NotFoundError';
      throw error;
    }

    const isAuthorized = paste.isPublic || paste.userId === userId || paste.shares.length > 0;
    if (!isAuthorized) {
      const error = new Error('Access denied');
      (error as any).status = 403;
      (error as any).name = 'ForbiddenError';
      throw error;
    }

    return await db.savedPaste.upsert({
      where: {
        pasteId_userId: {
          pasteId: id,
          userId,
        },
      },
      create: {
        pasteId: id,
        userId,
      },
      update: {},
    });
  }

  static async unsavePaste(id: string, userId: string) {
    await db.savedPaste.deleteMany({
      where: {
        pasteId: id,
        userId,
      },
    });
    return { success: true };
  }
}
