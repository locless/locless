import { mysqlTable, varchar, boolean, index, int, json, datetime } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { components } from './components';

export const branches = mysqlTable(
  'branches',
  {
    id: varchar('id', { length: 256 }).primaryKey(),
    name: varchar('name', { length: 256 }).notNull(),
    size: int('size').notNull(),
    fileUrl: varchar('fileUrl', { length: 256 }).notNull(),
    stats: json('stats').notNull(),
    componentId: varchar('component_id', { length: 256 })
      .notNull()
      .references(() => components.id, { onDelete: 'cascade' }),
    createdAt: datetime('created_at', { mode: 'date', fsp: 3 }),
    deletedAt: datetime('deleted_at', { mode: 'date', fsp: 3 }),
    enabled: boolean('enabled').notNull().default(true),
    canReverseDeletion: boolean('canReverseDeletion').notNull().default(true),
  },
  branches => ({
    componentIdx: index('componentIdx').on(branches.componentId),
  })
);

export const branchesRelations = relations(branches, ({ one }) => ({
  component: one(components, {
    relationName: 'component_branch_relation',
    fields: [branches.componentId],
    references: [components.id],
  }),
}));
