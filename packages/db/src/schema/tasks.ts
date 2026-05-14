import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { projects } from './projects';
import { resources } from './resources';

export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  assigneeId: uuid('assignee_id').references(() => resources.id),
  title: varchar('title', { length: 500 }).notNull(),
  status: varchar('status', { length: 20 }).$type<'todo' | 'doing' | 'done'>().default('todo'),
  priority: varchar('priority', { length: 10 })
    .$type<'alta' | 'media' | 'baixa'>()
    .default('media'),
  dueDate: timestamp('due_date'),
  adoWorkItemId: varchar('ado_work_item_id', { length: 50 }),
  adoType: varchar('ado_type', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
