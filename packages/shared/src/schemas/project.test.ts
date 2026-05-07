import { describe, expect, it } from 'vitest';
import { projectFinanceMonthlySchema } from './project';

describe('projectFinanceMonthlySchema', () => {
  it('aceita dados válidos', () => {
    const input = {
      projectId: '550e8400-e29b-41d4-a716-446655440000',
      year: 2025,
      month: 5,
      revenue: 34800,
      expenses: 0,
      commissions: 0,
      taxes: 0,
      harvestCost: 0,
      budgetMonth: 30000,
      hours: 120.5,
    };
    const result = projectFinanceMonthlySchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('rejeita projectId inválido (não-uuid)', () => {
    const result = projectFinanceMonthlySchema.safeParse({
      projectId: 'not-a-uuid',
      year: 2025,
      month: 5,
      revenue: 0,
      expenses: 0,
      commissions: 0,
      taxes: 0,
      harvestCost: 0,
      budgetMonth: 0,
      hours: 0,
    });
    expect(result.success).toBe(false);
  });

  it('rejeita mês fora de 1-12', () => {
    const result = projectFinanceMonthlySchema.safeParse({
      projectId: '550e8400-e29b-41d4-a716-446655440000',
      year: 2025,
      month: 13,
      revenue: 0,
      expenses: 0,
      commissions: 0,
      taxes: 0,
      harvestCost: 0,
      budgetMonth: 0,
      hours: 0,
    });
    expect(result.success).toBe(false);
  });

  it('rejeita valores negativos em revenue', () => {
    const result = projectFinanceMonthlySchema.safeParse({
      projectId: '550e8400-e29b-41d4-a716-446655440000',
      year: 2025,
      month: 5,
      revenue: -100,
      expenses: 0,
      commissions: 0,
      taxes: 0,
      harvestCost: 0,
      budgetMonth: 0,
      hours: 0,
    });
    expect(result.success).toBe(false);
  });
});
