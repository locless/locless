import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { paginationOptsValidator } from 'convex/server';

export const get = query({
    args: { paginationOpts: paginationOptsValidator, projectId: v.id('projects') },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (identity === null) {
            throw new Error('Unauthenticated call to mutation');
        }

        return await ctx.db
            .query('components')
            .withIndex('by_project', q => q.eq('projectId', args.projectId))
            .order('desc')
            .paginate(args.paginationOpts);
    },
});

export const getSingle = query({
    args: { componentId: v.id('components'), projectId: v.id('projects') },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (identity === null) {
            throw new Error('Unauthenticated call to mutation');
        }

        const workspace = await ctx.db
            .query('workspaces')
            .withIndex('by_token', q => q.eq('tenantId', identity.tokenIdentifier))
            .filter(q => q.eq(q.field('deletedAt'), undefined))
            .first();

        if (!workspace) {
            return null;
        }

        const project = await ctx.db.get(args.projectId);

        if (project?.workspaceId !== workspace._id) {
            return null;
        }

        const component = await ctx.db.get(args.componentId);

        if (component?.projectId !== project._id) {
            return null;
        }

        return component;
    },
});

export const create = mutation({
    args: {
        name: v.string(),
        projectId: v.id('projects'),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (identity === null) {
            throw new Error('Unauthenticated call to mutation');
        }

        const componentId = await ctx.db.insert('components', {
            name: args.name,
            projectId: args.projectId,
        });

        return componentId;
    },
});
