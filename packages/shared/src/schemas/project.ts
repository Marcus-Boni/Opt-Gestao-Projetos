import { z } from 'zod';

export const projectFinanceMonthlySchema = z.object({
  projectId: z.string().uuid(),
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
  revenue: z.number().nonnegative(),
  expenses: z.number().nonnegative(),
  commissions: z.number().nonnegative(),
  taxes: z.number().nonnegative(),
  harvestCost: z.number().nonnegative(),
  budgetMonth: z.number().nonnegative(),
  hours: z.number().nonnegative(),
});

export type ProjectFinanceMonthly = z.infer<typeof projectFinanceMonthlySchema>;
