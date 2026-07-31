import { Request, Response, NextFunction } from 'express';
import sanitizeHtml from 'sanitize-html';

/**
 * Strips script tags, iframe tags, inline event attributes, and javascript: links
 * from content strings while preserving normal programming characters (e.g. <, >)
 * so that code syntax highlighting in Monaco Editor is not altered.
 */
export function cleanScriptTags(text: string): string {
  if (!text) return text;
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '[stripped script]')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '[stripped iframe]')
    .replace(/on\w+\s*=\s*(['"])(.*?)\1/gi, '') // Strip event handlers like onload="foo"
    .replace(/javascript:\s*[\w\-\.\/]+/gi, ''); // Strip javascript: links
}

export function sanitizeMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.body) {
    // Titles should be pure text - strip all HTML tags entirely
    if (typeof req.body.title === 'string') {
      req.body.title = sanitizeHtml(req.body.title, {
        allowedTags: [],
        allowedAttributes: {},
      }).trim();
    }

    // Code/Markdown content - strip scripting execution payloads without encoding characters
    if (typeof req.body.content === 'string') {
      req.body.content = cleanScriptTags(req.body.content);
    }
  }
  next();
}
