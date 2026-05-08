import { describe, expect, it } from 'vitest';
import { calculateFinanceSummary, getFinancialTone } from './finance';

describe('calculateFinanceSummary', () => {
  it('calcula margem e sobras sem armazenar valores derivados', () => {
    const result = calculateFinanceSummary({
      revenue: 34_800,
      expenses: 2_200,
      commissions: 1_100,
      taxes: 3_400,
      harvestCost: 24_650,
      budget: 30_000,
      hours: 320.5,
    });

    expect(result.marginValue).toBe(3450);
    expect(result.marginPercent).toBeCloseTo(0.0991, 4);
    expect(result.remainingBudget).toBe(5350);
  });

  it('retorna margem percentual nula quando faturamento e zero', () => {
    const result = calculateFinanceSummary({
      revenue: 0,
      expenses: 500,
      commissions: 0,
      taxes: 0,
      harvestCost: 250,
      budget: 1000,
      hours: 12,
    });

    expect(result.marginValue).toBe(-750);
    expect(result.marginPercent).toBeNull();
  });
});

describe('getFinancialTone', () => {
  it('marca margem negativa como negativa', () => {
    expect(getFinancialTone({ kind: 'marginValue', value: -1 })).toBe('negative');
  });

  it('marca margem percentual baixa como alerta', () => {
    expect(getFinancialTone({ kind: 'marginPercent', value: 0.041 })).toBe('warning');
  });

  it('marca sobras baixas como alerta quando abaixo de 10 por cento do orcamento', () => {
    expect(getFinancialTone({ kind: 'remainingBudget', value: 900, budget: 10_000 })).toBe(
      'warning',
    );
  });
});
