import { mysqlTable, varchar, boolean, mysqlEnum, json, datetime, uniqueIndex, int } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { projects } from './projects';
import { components } from './components';
import { Subscriptions } from '@repo/billing';
import { translations } from './translations';

export const workspaces = mysqlTable(
  'workspaces',
  {
    id: varchar('id', { length: 256 }).primaryKey(),
    tenantId: varchar('tenantId', { length: 256 }).notNull(),
    name: varchar('name', { length: 256 }).notNull(),
    plan: mysqlEnum('plan', ['free', 'pro', 'enterprise']).notNull(),
    isPersonal: boolean('isPersonal').notNull(),
    stripeCustomerId: varchar('stripeCustomerId', { length: 256 }),
    subscriptions: json('subscriptions').$type<Subscriptions>(),
    createdAt: datetime('created_at', { mode: 'date', fsp: 3 }),
    deletedAt: datetime('deleted_at', { mode: 'date', fsp: 3 }),
    enabled: boolean('enabled').notNull().default(true),
    size: int('size').notNull().default(0),
    isUsageExceeded: boolean('isUsageExceeded').notNull().default(false),
    planDowngradeRequest: mysqlEnum('plan_downgrade_request', ['free']),
    planChanged: datetime('plan_changed', { fsp: 3 }),
  },
  table => ({
    tenantIdIdx: uniqueIndex('tenant_id_idx').on(table.tenantId),
  })
);

export const workspacesRelations = relations(workspaces, ({ many }) => ({
  projects: many(projects),
  components: many(components, {
    relationName: 'workspace_component_relation',
  }),
  translations: many(translations, {
    relationName: 'workspace_translation_relation',
  }),
}));
