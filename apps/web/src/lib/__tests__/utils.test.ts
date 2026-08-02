import { describe, it, expect } from 'vitest';
import { cn } from '../utils.js';

describe('cn utility', () => {
  it('should merge classes correctly', () => {
    const result = cn('class-1', 'class-2');
    expect(result).toBe('class-1 class-2');
  });

  it('should override conflicting tailwind classes', () => {
    const result = cn('px-2 py-1', 'p-4');
    expect(result).toBe('p-4');
  });

  it('should ignore falsey values', () => {
    const isFalse = false;
    const result = cn('class-1', isFalse && 'class-2', null, undefined, 'class-3');
    expect(result).toBe('class-1 class-3');
  });
});
