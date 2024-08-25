import { mysqlTable, varchar, boolean, index, datetime, int, json, text } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { projects } from './projects';
import { workspaces } from './workspaces';

export const components = mysqlTable(
  'components',
  {
    id: varchar('id', { length: 256 }).primaryKey(),
    name: varchar('name', { length: 256 }).notNull(),
    projectId: varchar('project_id', { length: 256 }).notNull(),
    workspaceId: varchar('workspace_id', { length: 256 }).notNull(),
    fileId: varchar('file_id', { length: 256 }).notNull(),
    fileUrl: text('file_url').notNull(),
    size: int('size').notNull(),
    stats: json('stats').notNull(),
    createdAt: datetime('created_at', { mode: 'date', fsp: 3 }),
    deletedAt: datetime('deleted_at', { mode: 'date', fsp: 3 }),
    updatedAt: datetime('updated_at', { mode: 'date', fsp: 3 }),
    enabled: boolean('enabled').notNull().default(true),
    canReverseDeletion: boolean('canReverseDeletion').notNull().default(true),
  },
  table => ({
    projectIdx: index('projectIdx').on(table.projectId),
    workspaceIdx: index('workspaceIdx').on(table.workspaceId),
    fileIdx: index('fileIdx').on(table.fileId),
    projectIdAndName: index('projectIdAndName').on(table.projectId, table.name),
  })
);

export const componentsRelations = relations(components, ({ one }) => ({
  workspace: one(workspaces, {
    relationName: 'workspace_component_relation',
    fields: [components.workspaceId],
    references: [workspaces.id],
  }),
  project: one(projects, {
    relationName: 'project_component_relation',
    fields: [components.projectId],
    references: [projects.id],
  }),
}));
