import { z } from 'zod';

export const projectStatusSchema = z.enum(['active', 'paused', 'completed', 'cancelled']);

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

export const financeSummarySchema = z.object({
  revenue: z.number(),
  expenses: z.number(),
  commissions: z.number(),
  taxes: z.number(),
  harvestCost: z.number(),
  budget: z.number(),
  hours: z.number(),
  marginValue: z.number(),
  marginPercent: z.number().nullable(),
  remainingBudget: z.number(),
});

export const matrixMonthSchema = financeSummarySchema.extend({
  id: z.string(),
  year: z.number().int(),
  month: z.number().int().min(1).max(12),
});

export const matrixProjectSchema = financeSummarySchema.extend({
  id: z.string(),
  name: z.string(),
  code: z.string().nullable(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  status: projectStatusSchema,
  months: z.array(matrixMonthSchema),
});

export const matrixClientSchema = financeSummarySchema.extend({
  id: z.string(),
  name: z.string(),
  taxId: z.string().nullable(),
  projects: z.array(matrixProjectSchema),
});

export const projectsMatrixResponseSchema = z.object({
  filters: z.object({
    year: z.number().int().nullable(),
    month: z.number().int().min(1).max(12).nullable(),
  }),
  clients: z.array(matrixClientSchema),
  total: financeSummarySchema,
});

export const projectDetailResponseSchema = matrixProjectSchema.extend({
  client: z.object({
    id: z.string(),
    name: z.string(),
  }),
  collaborators: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      role: z.string(),
      hours: z.number(),
      cost: z.number(),
    }),
  ),
  timeEntries: z.array(
    z.object({
      id: z.string(),
      date: z.string(),
      collaborator: z.string(),
      task: z.string(),
      hours: z.number(),
      billable: z.boolean(),
    }),
  ),
});

export type FinanceSummaryDto = z.infer<typeof financeSummarySchema>;
export type MatrixMonthDto = z.infer<typeof matrixMonthSchema>;
export type MatrixProjectDto = z.infer<typeof matrixProjectSchema>;
export type MatrixClientDto = z.infer<typeof matrixClientSchema>;
export type ProjectsMatrixResponseDto = z.infer<typeof projectsMatrixResponseSchema>;
export type ProjectDetailResponseDto = z.infer<typeof projectDetailResponseSchema>;
