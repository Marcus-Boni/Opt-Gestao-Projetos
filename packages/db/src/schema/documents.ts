import { integer, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { user } from './auth';
import { projects } from './projects';

export const documents = pgTable('documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 300 }).notNull(),
  category: varchar('category', { length: 50 }).$type<'contrato' | 'ata' | 'tecnico' | 'outro'>(),
  url: text('url').notNull(),
  version: integer('version').default(1).notNull(),
  uploadedBy: uuid('uploaded_by').references(() => user.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
