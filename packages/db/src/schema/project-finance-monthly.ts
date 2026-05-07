import { integer, numeric, pgTable, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { projects } from './projects';

export const projectFinanceMonthly = pgTable(
  'project_finance_monthly',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    year: integer('year').notNull(),
    month: integer('month').notNull(),
    revenue: numeric('revenue', { precision: 14, scale: 2 }).default('0').notNull(),
    expenses: numeric('expenses', { precision: 14, scale: 2 }).default('0').notNull(),
    commissions: numeric('commissions', { precision: 14, scale: 2 }).default('0').notNull(),
    taxes: numeric('taxes', { precision: 14, scale: 2 }).default('0').notNull(),
    harvestCost: numeric('harvest_cost', { precision: 14, scale: 2 }).default('0').notNull(),
    budgetMonth: numeric('budget_month', { precision: 14, scale: 2 }).default('0').notNull(),
    hours: numeric('hours', { precision: 10, scale: 2 }).default('0').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [uniqueIndex('uniq_project_year_month').on(t.projectId, t.year, t.month)],
);

export type ProjectFinanceMonthly = typeof projectFinanceMonthly.$inferSelect;
export type NewProjectFinanceMonthly = typeof projectFinanceMonthly.$inferInsert;
