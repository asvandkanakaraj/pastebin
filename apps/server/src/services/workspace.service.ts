import { db } from '@pastebin/database';

export class WorkspaceService {
  static async getUserWorkspace(userId: string) {
    // 1. My Pastes: Created by this user
    const myPastes = await db.paste.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // 2. Shared With Me: Intentional shares from others
    const shares = await db.share.findMany({
      where: { userId },
      include: {
        paste: {
          include: {
            user: {
              select: { username: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const sharedWithMe = shares
      .map((s) => ({
        id: s.paste.id,
        title: s.paste.title,
        language: s.paste.language,
        isPublic: s.paste.isPublic,
        createdAt: s.paste.createdAt,
        updatedAt: s.paste.updatedAt,
        expiresAt: s.paste.expiresAt,
        ownerUsername: s.paste.user?.username || 'unknown',
        sharedAt: s.createdAt,
      }))
      .filter((p) => !p.expiresAt || p.expiresAt > new Date());

    // 3. Saved (Bookmarks)
    const savedEntries = await db.savedPaste.findMany({
      where: { userId },
      include: {
        paste: {
          include: {
            user: {
              select: { id: true, username: true },
            },
            shares: {
              where: { userId },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const saved = savedEntries
      .map((s) => {
        const p = s.paste;
        const isAuthorized = p.isPublic || p.userId === userId || p.shares.length > 0;
        if (!isAuthorized) {
          return {
            id: p.id,
            title: 'Private Paste (Unavailable)',
            isAvailable: false,
            language: 'plaintext',
            createdAt: p.createdAt,
            expiresAt: p.expiresAt,
            savedAt: s.createdAt,
          };
        }
        return {
          id: p.id,
          title: p.title || 'Untitled Paste',
          isAvailable: true,
          language: p.language,
          isPublic: p.isPublic,
          createdAt: p.createdAt,
          expiresAt: p.expiresAt,
          updatedAt: p.updatedAt,
          ownerUsername: p.user?.username || 'unknown',
          savedAt: s.createdAt,
        };
      })
      .filter((p) => p.isAvailable && (!p.expiresAt || p.expiresAt > new Date()));

    // 4. Recently Viewed (limit to 5)
    const recentViews = await db.recentView.findMany({
      where: { userId },
      include: {
        paste: {
          include: {
            user: {
              select: { username: true },
            },
            shares: {
              where: { userId },
            },
          },
        },
      },
      orderBy: { viewedAt: 'desc' },
      take: 5,
    });

    const recentlyViewed = recentViews
      .map((r) => {
        const p = r.paste;
        const isAuthorized = p.isPublic || p.userId === userId || p.shares.length > 0;
        if (!isAuthorized) {
          return {
            id: p.id,
            title: 'Private Paste (Unavailable)',
            isAvailable: false,
            language: 'plaintext',
            viewedAt: r.viewedAt,
          };
        }
        return {
          id: p.id,
          title: p.title || 'Untitled Paste',
          isAvailable: true,
          language: p.language,
          isPublic: p.isPublic,
          createdAt: p.createdAt,
          expiresAt: p.expiresAt,
          ownerUsername: p.user?.username || 'unknown',
          viewedAt: r.viewedAt,
        };
      })
      .filter((p) => p.isAvailable && (!p.expiresAt || p.expiresAt > new Date()));

    return {
      myPastes,
      sharedWithMe,
      saved,
      recentlyViewed,
    };
  }
}
