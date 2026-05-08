import { describe, expect, it } from 'vitest';
import { getUserInitials, normalizeUserImage } from './user-profile';

describe('normalizeUserImage', () => {
  it('keeps data urls unchanged', () => {
    expect(normalizeUserImage('data:image/png;base64,abc')).toBe('data:image/png;base64,abc');
  });

  it('converts raw Microsoft base64 photos to image data urls', () => {
    expect(normalizeUserImage('/9j/4AAQSkZJRgABAQ')).toBe(
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ',
    );
  });

  it('keeps remote image urls unchanged', () => {
    expect(normalizeUserImage('https://example.com/avatar.png')).toBe(
      'https://example.com/avatar.png',
    );
  });
});

describe('getUserInitials', () => {
  it('uses first letters from full name', () => {
    expect(getUserInitials('Maria Galvao', 'maria@example.com')).toBe('MG');
  });

  it('falls back to email when name is missing', () => {
    expect(getUserInitials('', 'suporte@optsolv.com')).toBe('SU');
  });
});
