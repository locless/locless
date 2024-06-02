import { mysqlTable, varchar, boolean, index, datetime } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { projects } from './projects';
import { workspaces } from './workspaces';
import { branches } from './branches';

export const components = mysqlTable(
  'components',
  {
    id: varchar('id', { length: 256 }).primaryKey(),
    name: varchar('name', { length: 256 }).notNull(),
    projectId: varchar('workspace_id', { length: 256 })
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    workspaceId: varchar('workspace_id', { length: 256 })
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    createdAt: datetime('created_at', { mode: 'date', fsp: 3 }),
    deletedAt: datetime('deleted_at', { mode: 'date', fsp: 3 }),
    enabled: boolean('enabled').notNull().default(true),
    canReverseDeletion: boolean('canReverseDeletion').notNull().default(true),
  },
  components => ({
    projectIdx: index('projectIdx').on(components.projectId),
    workspaceIdx: index('workspaceIdx').on(components.workspaceId),
  })
);

export const componentsRelations = relations(components, ({ one, many }) => ({
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
  branches: many(branches, {
    relationName: 'component_branch_relation',
  }),
}));
