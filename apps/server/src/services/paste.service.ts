import { db } from '@pastebin/database';
import bcrypt from 'bcrypt';

export class PasteService {
  static async createPaste(data: {
    title?: string;
    content: string;
    language?: string;
    isPublic?: boolean;
    password?: string;
    expiresInSeconds?: number;
  }) {
    let passwordHash: string | undefined = undefined;
    if (data.password) {
      passwordHash = await bcrypt.hash(data.password, 10);
    }

    let expiresAt: Date | undefined = undefined;
    if (data.expiresInSeconds) {
      expiresAt = new Date(Date.now() + data.expiresInSeconds * 1000);
    }

    return await db.paste.create({
      data: {
        title: data.title,
        content: data.content,
        language: data.language || 'plaintext',
        isPublic: data.isPublic !== false,
        passwordHash,
        expiresAt,
      },
    });
  }

  static async getPasteById(id: string, passwordInput?: string) {
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

    // Password check
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
    }

    // Exclude passwordHash from returned object
    const { passwordHash, ...safePaste } = paste;
    return safePaste;
  }

  static async listPublicPastes(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const pastes = await db.paste.findMany({
      where: {
        isPublic: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    return pastes.map(({ passwordHash, ...safePaste }) => safePaste);
  }

  static async deletePaste(id: string, passwordInput?: string) {
    const paste = await db.paste.findUnique({
      where: { id },
    });

    if (!paste) {
      const error = new Error('Paste not found');
      (error as any).status = 404;
      (error as any).name = 'NotFoundError';
      throw error;
    }

    if (paste.passwordHash) {
      if (!passwordInput) {
        const error = new Error('Password required to delete this paste');
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

    await db.paste.delete({
      where: { id },
    });

    return { success: true };
  }
}
