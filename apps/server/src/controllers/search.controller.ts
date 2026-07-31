import { Request, Response, NextFunction } from 'express';
import { SearchService } from '../services/search.service.js';

export class SearchController {
  static async search(req: Request, res: Response, next: NextFunction) {
    try {
      const q = (req.query.q as string) || '';
      const results = await SearchService.globalSearch(q);
      res.json(results);
    } catch (error) {
      next(error);
    }
  }
}
