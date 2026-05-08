import { describe, expect, it } from 'vitest';
import { getAuthRedirectTarget, userCanAccessApp } from './auth-guards';

describe('userCanAccessApp', () => {
  it('blocks access when the session is missing', () => {
    expect(userCanAccessApp(null)).toBe(false);
  });

  it('allows access when the session has a user', () => {
    expect(userCanAccessApp({ user: { id: 'user-1' } })).toBe(true);
  });
});

describe('getAuthRedirectTarget', () => {
  it('keeps the originally requested app path for login return', () => {
    expect(getAuthRedirectTarget('/app/projetos?year=2025')).toBe(
      '/login?redirect=%2Fapp%2Fprojetos%3Fyear%3D2025',
    );
  });
});
