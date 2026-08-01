import { db } from '@pastebin/database';

export class SearchService {
  static async globalSearch(q: string) {
    let query = q.trim();
    if (!query) {
      return { users: [], pastes: [] };
    }

    if (query.startsWith('@')) {
      query = query.substring(1);
    }

    const lowerQuery = query.toLowerCase();
    const upperQuery = query.toUpperCase();

    // Query matching users by Username or Email (limit to 50)
    const dbUsers = await db.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { displayName: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 50,
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
      },
    });

    // Query matching public, non-expired pastes by Title or Paste Code ID
    const dbPastes = await db.paste.findMany({
      where: {
        visibility: 'PUBLIC',
        isPublic: true,
        AND: [
          {
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          },
          {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { id: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      take: 50,
      select: {
        id: true,
        title: true,
        isPublic: true,
        visibility: true,
        language: true,
        createdAt: true,
      },
    });

    // Custom sorting scoring functions based on spec priority
    const getUserScore = (user: any) => {
      const username = (user.username || '').toLowerCase();
      const email = (user.email || '').toLowerCase();

      if (username === lowerQuery) return 1;
      if (email === lowerQuery) return 2;
      if (username.startsWith(lowerQuery)) return 4;
      if (username.includes(lowerQuery)) return 5;
      if (email.startsWith(lowerQuery)) return 6;
      if (email.includes(lowerQuery)) return 7;
      return 10;
    };

    const getPasteScore = (paste: any) => {
      const title = (paste.title || '').toLowerCase();
      const code = (paste.id || '').toUpperCase();

      if (code === upperQuery) return 0; // Paste code match has highest priority
      if (title === lowerQuery) return 3;
      if (title.startsWith(lowerQuery)) return 8;
      if (title.includes(lowerQuery)) return 9;
      return 10;
    };

    // Sort users and pastes based on score priority
    const sortedUsers = dbUsers
      .map((u) => ({ ...u, score: getUserScore(u) }))
      .sort((a, b) => a.score - b.score)
      .map(({ score, ...u }) => u);

    const sortedPastes = dbPastes
      .map((p) => ({ ...p, score: getPasteScore(p) }))
      .sort((a, b) => a.score - b.score)
      .map(({ score, ...p }) => p);

    return {
      users: sortedUsers,
      pastes: sortedPastes,
    };
  }
}
