import { describe, expect, it } from 'vitest';
import { buildServer } from '../../server';

describe('GET /health', () => {
  it('retorna 200 com status ok', async () => {
    const app = await buildServer();
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);

    const body = response.json<{ status: string; timestamp: string; version: string }>();
    expect(body.status).toBe('ok');
    expect(typeof body.timestamp).toBe('string');
    expect(typeof body.version).toBe('string');
    expect(() => new Date(body.timestamp)).not.toThrow();
  });
});
