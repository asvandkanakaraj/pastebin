import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PasteService } from '../paste.service.js';
import { db } from '@pastebin/database';

// Mock the database client module
vi.mock('@pastebin/database', () => {
  const mockDb = {
    $transaction: vi.fn((cb) => cb(mockDb)),
    paste: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      delete: vi.fn(),
    },
    share: {
      createMany: vi.fn(),
      findFirst: vi.fn(),
    },
  };
  return {
    db: mockDb,
  };
});

describe('PasteService Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createPaste', () => {
    it('should successfully create a public paste without a password', async () => {
      const mockPaste = {
        id: 'paste-id-123',
        title: 'Mocked Paste',
        description: null,
        content: 'console.log("hello test");',
        language: 'javascript',
        isPublic: true,
        visibility: 'PUBLIC',
        passwordHash: null,
        expiresAt: null,
        userId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.paste.create).mockResolvedValue(mockPaste);

      const result = await PasteService.createPaste({
        title: 'Mocked Paste',
        content: 'console.log("hello test");',
        language: 'javascript',
        isPublic: true,
      });

      expect(db.paste.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'Mocked Paste',
            content: 'console.log("hello test");',
            language: 'javascript',
            isPublic: true,
          }),
        })
      );
      expect(result).toEqual(mockPaste);
    });
  });

  describe('getPasteById', () => {
    it('should retrieve a public paste and indicate if password protection is disabled', async () => {
      const mockPaste = {
        id: 'paste-id-123',
        title: 'Mocked Paste',
        description: null,
        content: 'content here',
        language: 'plaintext',
        isPublic: true,
        visibility: 'PUBLIC',
        passwordHash: null,
        expiresAt: null,
        userId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.paste.findUnique).mockResolvedValue(mockPaste);

      const result = await PasteService.getPasteById('paste-id-123');

      expect(db.paste.findUnique).toHaveBeenCalledWith({
        where: { id: 'paste-id-123' },
      });
      const { passwordHash, ...expectedSafePaste } = mockPaste;
      expect(result).toEqual({
        ...expectedSafePaste,
        sharePermission: null,
        hasPassword: false,
      });
    });

    it('should throw an error if the paste is expired', async () => {
      const mockExpiredPaste = {
        id: 'expired-id',
        title: 'Expired Paste',
        description: null,
        content: 'expired content',
        language: 'plaintext',
        isPublic: true,
        visibility: 'PUBLIC',
        passwordHash: null,
        expiresAt: new Date(Date.now() - 10000), // expired 10s ago
        userId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.paste.findUnique).mockResolvedValue(mockExpiredPaste);

      await expect(PasteService.getPasteById('expired-id')).rejects.toThrow(
        expect.objectContaining({
          status: 410,
          message: 'Paste has expired',
        })
      );
    });
  });
});
