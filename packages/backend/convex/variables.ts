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
            .query('variables')
            .withIndex('by_workspace', q => q.eq('workspaceId', args.workspaceId))
            .order('desc')
            .paginate(args.paginationOpts);
    },
});

export const getByGroup = query({
    args: {
        paginationOpts: paginationOptsValidator,
        workspaceId: v.id('workspaces'),
        variableGroupId: v.id('variableGroups'),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (identity === null) {
            throw new Error('Unauthenticated call to mutation');
        }

        return await ctx.db
            .query('variables')
            .withIndex('by_workspace_and_group', q =>
                q.eq('workspaceId', args.workspaceId).eq('variableGroupId', args.variableGroupId)
            )
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
            .query('variables')
            .withSearchIndex('search_name', q => q.search('name', args.search))
            .filter(q => q.eq(q.field('workspaceId'), args.workspaceId))
            .paginate(args.paginationOpts);
    },
});

export const getSingle = query({
    args: { variableId: v.id('variables') },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (identity === null) {
            throw new Error('Unauthenticated call to mutation');
        }

        return await ctx.db.get(args.variableId);
    },
});

export const create = mutation({
    args: {
        name: v.string(),
        value: v.string(),
        workspaceId: v.id('workspaces'),
        variableGroupId: v.optional(v.id('variableGroups')),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (identity === null) {
            throw new Error('Unauthenticated call to mutation');
        }

        const variableId = await ctx.db.insert('variables', {
            name: args.name,
            value: args.value,
            workspaceId: args.workspaceId,
            variableGroupId: args.variableGroupId,
        });

        return variableId;
    },
});

export const createGroup = mutation({
    args: {
        name: v.string(),
        workspaceId: v.id('workspaces'),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (identity === null) {
            throw new Error('Unauthenticated call to mutation');
        }

        const variableId = await ctx.db.insert('variableGroups', {
            name: args.name,
            workspaceId: args.workspaceId,
        });

        return variableId;
    },
});

export const setGroup = mutation({
    args: {
        variableId: v.id('variables'),
        variableGroupId: v.id('variableGroups'),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (identity === null) {
            throw new Error('Unauthenticated call to mutation');
        }

        const variableId = await ctx.db.patch(args.variableId, {
            variableGroupId: args.variableGroupId,
        });

        return variableId;
    },
});

export const removeGroup = mutation({
    args: {
        variableId: v.id('variables'),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (identity === null) {
            throw new Error('Unauthenticated call to mutation');
        }

        const variableId = await ctx.db.patch(args.variableId, {
            variableGroupId: undefined,
        });

        return variableId;
    },
});

export const edit = mutation({
    args: {
        variableId: v.id('variables'),
        name: v.string(),
        value: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (identity === null) {
            throw new Error('Unauthenticated call to mutation');
        }

        const variableId = await ctx.db.patch(args.variableId, {
            name: args.name,
            value: args.value,
        });

        return variableId;
    },
});

export const remove = mutation({
    args: {
        variableId: v.id('variables'),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (identity === null) {
            throw new Error('Unauthenticated call to mutation');
        }

        await ctx.db.delete(args.variableId);
    },
});
