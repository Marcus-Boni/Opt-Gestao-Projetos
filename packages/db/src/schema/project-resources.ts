import { numeric, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { projects } from './projects';
import { resources } from './resources';

export const projectResources = pgTable('project_resources', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  resourceId: uuid('resource_id')
    .notNull()
    .references(() => resources.id, { onDelete: 'cascade' }),
  hoursPlanned: numeric('hours_planned', { precision: 8, scale: 2 }),
  hoursActual: numeric('hours_actual', { precision: 8, scale: 2 }).default('0'),
  allocation: numeric('allocation', { precision: 5, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type ProjectResource = typeof projectResources.$inferSelect;
export type NewProjectResource = typeof projectResources.$inferInsert;
