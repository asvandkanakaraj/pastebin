import { Request, Response, NextFunction } from 'express';
import { CreatePasteSchema } from '@pastebin/shared';
import { PasteService } from '../services/paste.service.js';

export class PasteController {
  static async createPaste(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = CreatePasteSchema.parse(req.body);
      const userId = (req as any).user?.userId;
      const paste = await PasteService.createPaste({ ...validatedData, userId });
      res.status(201).json(paste);
    } catch (error) {
      next(error);
    }
  }

  static async getPaste(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const password = req.headers['x-paste-password'] as string | undefined;
      const paste = await PasteService.getPasteById(id, password);
      res.json(paste);
    } catch (error) {
      next(error);
    }
  }

  static async listPastes(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const pastes = await PasteService.listPublicPastes(page, limit);
      res.json(pastes);
    } catch (error) {
      next(error);
    }
  }

  static async getMyPastes(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({
          error: 'UnauthorizedError',
          message: 'Access token required',
        });
      }
      const pastes = await PasteService.listUserPastes(userId);
      res.json(pastes);
    } catch (error) {
      next(error);
    }
  }

  static async deletePaste(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const password = req.headers['x-paste-password'] as string | undefined;
      await PasteService.deletePaste(id, password);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
