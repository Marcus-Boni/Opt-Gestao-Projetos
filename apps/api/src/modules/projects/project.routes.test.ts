import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildServer } from '../../server';

describe('GET /api/projects/matrix', () => {
  let app: Awaited<ReturnType<typeof buildServer>>;

  beforeAll(async () => {
    app = await buildServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('bloqueia acesso sem sessao autenticada', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/projects/matrix?year=2025',
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchObject({ message: 'Sessao obrigatoria' });
  });
});
