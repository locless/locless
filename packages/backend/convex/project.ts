import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { paginationOptsValidator } from 'convex/server';

export const get = query({
    args: { paginationOpts: paginationOptsValidator, workspaceId: v.id('workspaces') },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (identity === null) {
            throw new Error('Unauthenticated call to mutation');
        }

        return await ctx.db
            .query('projects')
            .withIndex('by_workspaces', q => q.eq('workspaceId', args.workspaceId))
            .order('desc')
            .paginate(args.paginationOpts);
    },
});

export const getSearch = query({
    args: { paginationOpts: paginationOptsValidator, search: v.string(), workspaceId: v.id('workspaces') },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (identity === null) {
            throw new Error('Unauthenticated call to mutation');
        }

        return await ctx.db
            .query('projects')
            .withSearchIndex('search_name', q => q.search('name', args.search))
            .filter(q => q.eq(q.field('workspaceId'), args.workspaceId))
            .paginate(args.paginationOpts);
    },
});

export const getSingle = query({
    args: { projectId: v.id('projects') },
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

        return project;
    },
});

export const create = mutation({
    args: {
        name: v.string(),
        workspaceId: v.id('workspaces'),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (identity === null) {
            throw new Error('Unauthenticated call to mutation');
        }

        const projectId = await ctx.db.insert('projects', {
            name: args.name,
            workspaceId: args.workspaceId,
        });

        return projectId;
    },
});

export const remove = mutation({
    args: {
        projectId: v.id('projects'),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (identity === null) {
            throw new Error('Unauthenticated call to mutation');
        }

        await ctx.db.patch(args.projectId, { deletedAt: new Date().getTime() });
    },
});

export const rename = mutation({
    args: {
        projectId: v.id('projects'),
        name: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (identity === null) {
            throw new Error('Unauthenticated call to mutation');
        }

        await ctx.db.patch(args.projectId, { name: args.name });
    },
});
