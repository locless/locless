import { mysqlTable, varchar, boolean, index, datetime } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { workspaces } from './workspaces';
import { components, translations } from '../schema';

export const projects = mysqlTable(
  'projects',
  {
    id: varchar('id', { length: 256 }).primaryKey(),
    name: varchar('name', { length: 256 }).notNull(),
    workspaceId: varchar('workspace_id', { length: 256 }).notNull(),
    createdAt: datetime('created_at', { mode: 'date', fsp: 3 }),
    deletedAt: datetime('deleted_at', { mode: 'date', fsp: 3 }),
    enabled: boolean('enabled').notNull().default(true),
  },
  table => ({
    workspaceIdx: index('workspaceIdx').on(table.workspaceId),
  })
);

export const projectsRelations = relations(projects, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [projects.workspaceId],
    references: [workspaces.id],
  }),
  components: many(components, {
    relationName: 'project_component_relation',
  }),
  translations: many(translations, {
    relationName: 'project_translation_relation',
  }),
}));
