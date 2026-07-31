import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { db } from '@pastebin/database';

vi.mock('@pastebin/database', () => {
  return {
    db: {
      $queryRaw: vi.fn(),
      paste: {
        findMany: vi.fn(),
        count: vi.fn(),
      },
    },
  };
});

describe('API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /health', () => {
    it('should return 200 OK when database is connected', async () => {
      vi.mocked(db.$queryRaw).mockResolvedValue([{ '1': 1 }]);

      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: 'up',
          services: expect.objectContaining({
            database: 'connected',
            api: 'healthy',
          }),
        })
      );
    });

    it('should return 503 Service Unavailable when database query fails', async () => {
      vi.mocked(db.$queryRaw).mockRejectedValue(new Error('DB Connection Refused'));

      const response = await request(app).get('/health');

      expect(response.status).toBe(503);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: 'down',
          services: expect.objectContaining({
            database: 'disconnected',
            api: 'healthy',
          }),
          error: 'DB Connection Refused',
        })
      );
    });
  });

  describe('GET /api/pastes', () => {
    it('should retrieve a paginated list of public pastes', async () => {
      const mockPastes = [
        {
          id: 'paste-1',
          title: 'Public Paste 1',
          content: 'code content',
          language: 'javascript',
          isPublic: true,
          passwordHash: null,
          expiresAt: null,
          userId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      vi.mocked(db.paste.findMany).mockResolvedValue(mockPastes as any);
      vi.mocked(db.paste.count).mockResolvedValue(1);

      const response = await request(app).get('/api/pastes?page=1&limit=10');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          pastes: expect.arrayContaining([
            expect.objectContaining({
              id: 'paste-1',
              title: 'Public Paste 1',
              hasPassword: false,
            }),
          ]),
          totalCount: 1,
          totalPages: 1,
          currentPage: 1,
        })
      );
    });
  });
});
