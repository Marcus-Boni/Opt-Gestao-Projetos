import { numeric, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { clients } from './clients';

export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientId: uuid('client_id')
    .notNull()
    .references(() => clients.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 200 }).notNull(),
  code: varchar('code', { length: 50 }),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  status: varchar('status', { length: 20 })
    .$type<'active' | 'paused' | 'completed' | 'cancelled'>()
    .default('active'),
  budget: numeric('budget', { precision: 14, scale: 2 }),
  harvestProjectId: varchar('harvest_project_id', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
