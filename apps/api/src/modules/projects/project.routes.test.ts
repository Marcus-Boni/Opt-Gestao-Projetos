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

  it('retorna matriz hierarquica com totais calculados', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/projects/matrix?year=2025',
    });

    expect(response.statusCode).toBe(200);

    const body = response.json<{
      clients: Array<{
        id: string;
        name: string;
        projects: Array<{ months: Array<{ year: number; month: number }> }>;
      }>;
      total: { revenue: number; marginValue: number; remainingBudget: number };
    }>();

    expect(body.clients.length).toBeGreaterThan(0);
    expect(body.clients[0]?.projects.length).toBeGreaterThan(0);
    expect(body.clients[0]?.projects[0]?.months.every((month) => month.year === 2025)).toBe(true);
    expect(body.total.revenue).toBeGreaterThan(0);
    expect(body.total.marginValue).toBeTypeOf('number');
    expect(body.total.remainingBudget).toBeTypeOf('number');
  });
});
