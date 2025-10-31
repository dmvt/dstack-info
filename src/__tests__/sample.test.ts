import { describe, it, expect } from 'vitest';

describe('Vitest Setup', () => {
  it('should run basic test', () => {
    expect(true).toBe(true);
  });

  it('should perform simple math', () => {
    expect(2 + 2).toBe(4);
  });

  it('should handle string operations', () => {
    expect('dstack').toContain('stack');
  });
});
