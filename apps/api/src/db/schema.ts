import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text, index } from 'drizzle-orm/sqlite-core';

export const workspaces = sqliteTable('workspaces', {
    id: text('id', { length: 36 })
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    tenantId: text('tenantId', { length: 256 }).notNull().unique(),
    name: text('name', { length: 256 }).notNull(),
    plan: text('plan', { length: 256 }).notNull(),
    isPersonal: integer('isPersonal', { mode: 'boolean' }).notNull(),
    stripeCustomerId: text('stripeCustomerId', { length: 256 }),
    stripeSubscriptionId: text('stripeSubscriptionId', { length: 256 }),
    subscriptions: text('subscriptions'),
    createdAt: text('createdAt')
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
});

export const projects = sqliteTable(
    'projects',
    {
        id: text('id', { length: 36 })
            .primaryKey()
            .$defaultFn(() => crypto.randomUUID()),
        name: text('name', { length: 256 }).notNull(),
        workspaceId: text('workspaceId', { length: 36 })
            .notNull()
            .references(() => workspaces.id, { onDelete: 'cascade' }),
        createdAt: text('createdAt')
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
    },
    projects => ({
        workspaceIdx: index('workspaceIdx').on(projects.workspaceId),
    })
);

export const components = sqliteTable(
    'components',
    {
        id: text('id', { length: 36 })
            .primaryKey()
            .$defaultFn(() => crypto.randomUUID()),
        name: text('name', { length: 256 }).notNull(),
        size: integer('size', { mode: 'number' }).notNull(),
        fileUrl: text('fileUrl', { length: 256 }).notNull(),
        projectId: text('projectId', { length: 36 })
            .notNull()
            .references(() => projects.id, { onDelete: 'cascade' }),
        createdAt: text('createdAt')
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
    },
    components => ({
        projectIdx: index('projectIdx').on(components.projectId),
    })
);
