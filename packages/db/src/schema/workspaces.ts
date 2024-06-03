import { mysqlTable, varchar, boolean, mysqlEnum, json, datetime } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { projects } from './projects';
import { components } from './components';

export const workspaces = mysqlTable('workspaces', {
  id: varchar('id', { length: 256 }).primaryKey(),
  tenantId: varchar('tenantId', { length: 256 }).notNull().unique(),
  name: varchar('name', { length: 256 }).notNull(),
  plan: mysqlEnum('plan', ['free', 'pro', 'enterprise']).notNull(),
  isPersonal: boolean('isPersonal').notNull(),
  stripeCustomerId: varchar('stripeCustomerId', { length: 256 }),
  stripeSubscriptionId: varchar('stripeSubscriptionId', { length: 256 }),
  subscriptions: json('subscriptions'),
  createdAt: datetime('created_at', { mode: 'date', fsp: 3 }),
  deletedAt: datetime('deleted_at', { mode: 'date', fsp: 3 }),
  enabled: boolean('enabled').notNull().default(true),
  canReverseDeletion: boolean('canReverseDeletion').notNull().default(true), // We need to set this value in order to be able to delete workspaces after 30 days without user be able to reverse deletion
});

export const workspacesRelations = relations(workspaces, ({ many }) => ({
  projects: many(projects),
  components: many(components, {
    relationName: 'workspace_component_relation',
  }),
}));