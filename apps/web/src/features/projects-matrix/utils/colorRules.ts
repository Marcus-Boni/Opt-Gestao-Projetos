import { type FinancialTone, getFinancialTone } from '@optsolv/shared';
import { cn } from '@/shared/lib/utils';

const toneClass: Record<FinancialTone, string> = {
  positive: 'text-financial-positive',
  negative: 'text-financial-negative',
  warning: 'text-financial-warning',
  neutral: 'text-muted-foreground',
};

export function financialToneClass(tone: FinancialTone, className?: string) {
  return cn(toneClass[tone], className);
}

export function marginValueClass(value: number) {
  return financialToneClass(getFinancialTone({ kind: 'marginValue', value }));
}

export function marginPercentClass(value: number | null) {
  return financialToneClass(getFinancialTone({ kind: 'marginPercent', value }));
}

export function remainingBudgetClass(value: number, budget: number) {
  return financialToneClass(getFinancialTone({ kind: 'remainingBudget', value, budget }));
}
