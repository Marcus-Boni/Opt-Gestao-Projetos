export type FinanceInput = {
  revenue: number;
  expenses: number;
  commissions: number;
  taxes: number;
  harvestCost: number;
  budget: number;
  hours: number;
};

export type FinanceSummary = FinanceInput & {
  marginValue: number;
  marginPercent: number | null;
  remainingBudget: number;
};

export type FinancialTone = 'positive' | 'negative' | 'warning' | 'neutral';

export type FinancialToneInput =
  | { kind: 'marginValue'; value: number }
  | { kind: 'marginPercent'; value: number | null }
  | { kind: 'remainingBudget'; value: number; budget: number };

export function calculateFinanceSummary(input: FinanceInput): FinanceSummary {
  const marginValue =
    input.revenue - input.expenses - input.commissions - input.taxes - input.harvestCost;
  const marginPercent = input.revenue > 0 ? marginValue / input.revenue : null;
  const remainingBudget = input.budget - input.harvestCost;

  return {
    ...input,
    marginValue,
    marginPercent,
    remainingBudget,
  };
}

export function sumFinance(inputs: FinanceInput[]): FinanceSummary {
  const total = inputs.reduce<FinanceInput>(
    (acc, item) => ({
      revenue: acc.revenue + item.revenue,
      expenses: acc.expenses + item.expenses,
      commissions: acc.commissions + item.commissions,
      taxes: acc.taxes + item.taxes,
      harvestCost: acc.harvestCost + item.harvestCost,
      budget: acc.budget + item.budget,
      hours: acc.hours + item.hours,
    }),
    {
      revenue: 0,
      expenses: 0,
      commissions: 0,
      taxes: 0,
      harvestCost: 0,
      budget: 0,
      hours: 0,
    },
  );

  return calculateFinanceSummary(total);
}

export function getFinancialTone(input: FinancialToneInput): FinancialTone {
  if (input.kind === 'marginValue') {
    return input.value < 0 ? 'negative' : 'positive';
  }

  if (input.kind === 'marginPercent') {
    if (input.value === null) return 'neutral';
    if (input.value < 0) return 'negative';
    if (input.value < 0.05) return 'warning';
    return 'positive';
  }

  if (input.value < 0) return 'negative';
  if (input.value < input.budget * 0.1) return 'warning';
  return 'positive';
}
