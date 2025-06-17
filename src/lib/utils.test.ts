import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
vi.mock('./appwrite/config', () => ({ appwriteConfig: {}, databases: {} }));
import { multiFormatDateString } from './utils';

describe('multiFormatDateString', () => {
  const baseDate = new Date('2024-01-01T00:00:00Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(baseDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "Just now" for times under a minute', () => {
    const ts = new Date(baseDate.getTime() - 30 * 1000).toISOString();
    expect(multiFormatDateString(ts)).toBe('Just now');
  });

  it('returns "5 minutes ago" for minutes difference', () => {
    const ts = new Date(baseDate.getTime() - 5 * 60 * 1000).toISOString();
    expect(multiFormatDateString(ts)).toBe('5 minutes ago');
  });

  it('returns "3 days ago" for days difference', () => {
    const ts = new Date(baseDate.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(multiFormatDateString(ts)).toBe('3 days ago');
  });
});
