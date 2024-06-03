import { mysqlTable, varchar, boolean, index, datetime } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { workspaces } from './workspaces';
import { components } from '../schema';

export const projects = mysqlTable(
  'projects',
  {
    id: varchar('id', { length: 256 }).primaryKey(),
    name: varchar('name', { length: 256 }).notNull(),
    workspaceId: varchar('workspace_id', { length: 256 }).notNull(),
    createdAt: datetime('created_at', { mode: 'date', fsp: 3 }),
    deletedAt: datetime('deleted_at', { mode: 'date', fsp: 3 }),
    enabled: boolean('enabled').notNull().default(true),
    canReverseDeletion: boolean('canReverseDeletion').notNull().default(true),
    keyAuth: varchar('key_auth', { length: 256 }).notNull().unique(),
    keyPublic: varchar('key_public', { length: 256 }).notNull().unique(),
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
}));
