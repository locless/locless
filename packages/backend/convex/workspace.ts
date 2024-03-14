import { mutation, query } from './_generated/server';

export const getWorkspace = query({
    args: {},
    handler: async ctx => {
        const identity = await ctx.auth.getUserIdentity();
        if (identity === null) {
            throw new Error('Unauthenticated call to query');
        }

        return await ctx.db
            .query('workspaces')
            .withIndex('by_token', q => q.eq('tenantId', identity.tokenIdentifier))
            .filter(q => q.eq(q.field('deletedAt'), undefined))
            .first();
    },
});

export const createPersonal = mutation({
    args: {},
    handler: async ctx => {
        const identity = await ctx.auth.getUserIdentity();
        if (identity === null) {
            throw new Error('Unauthenticated call to mutation');
        }

        const potentialWorkspace = await ctx.db
            .query('workspaces')
            .withIndex('by_token', q => q.eq('tenantId', identity.tokenIdentifier))
            .filter(q => q.eq(q.field('deletedAt'), undefined))
            .first();

        if (potentialWorkspace) {
            return potentialWorkspace;
        }

        const workspaceId = await ctx.db.insert('workspaces', {
            name: 'Personal Workspace',
            tenantId: identity.tokenIdentifier,
            isPersonal: true,
            plan: 'free',
        });

        return workspaceId;
    },
});
