import { boolean, numeric, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { user } from './auth';
import { clients } from './clients';

export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientId: uuid('client_id')
    .notNull()
    .references(() => clients.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 200 }).notNull(),
  code: varchar('code', { length: 50 }),
  type: varchar('type', { length: 50 }).$type<
    'desenvolvimento' | 'sustentação' | 'implantação' | 'consultoria'
  >(),
  status: varchar('status', { length: 20 })
    .$type<'no_prazo' | 'alerta' | 'critico' | 'concluido' | 'cancelado'>()
    .default('no_prazo'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  managerId: text('manager_id').references(() => user.id),
  budget: numeric('budget', { precision: 14, scale: 2 }),
  contractPrice: numeric('contract_price', { precision: 14, scale: 2 }),
  progressPlanned: numeric('progress_planned', { precision: 5, scale: 2 }).default('0'),
  progressActual: numeric('progress_actual', { precision: 5, scale: 2 }).default('0'),
  optTimeProjectId: varchar('opt_time_project_id', { length: 100 }),
  adoProjectId: varchar('ado_project_id', { length: 200 }),
  harvestProjectId: varchar('harvest_project_id', { length: 100 }),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
