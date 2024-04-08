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
            .query('translations')
            .withIndex('by_workspace', q => q.eq('workspaceId', args.workspaceId))
            .order('desc')
            .paginate(args.paginationOpts);
    },
});

export const getByGroup = query({
    args: {
        paginationOpts: paginationOptsValidator,
        workspaceId: v.id('workspaces'),
        translationGroupId: v.id('translationGroups'),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (identity === null) {
            throw new Error('Unauthenticated call to mutation');
        }

        return await ctx.db
            .query('translations')
            .withIndex('by_workspace_and_group', q =>
                q.eq('workspaceId', args.workspaceId).eq('translationGroupId', args.translationGroupId)
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
            .query('translations')
            .withSearchIndex('search_name', q => q.search('name', args.search))
            .filter(q => q.eq(q.field('workspaceId'), args.workspaceId))
            .paginate(args.paginationOpts);
    },
});

export const getSingle = query({
    args: { translationId: v.id('translations') },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (identity === null) {
            throw new Error('Unauthenticated call to mutation');
        }

        return await ctx.db.get(args.translationId);
    },
});

export const create = mutation({
    args: {
        name: v.string(),
        value: v.array(
            v.object({
                lang: v.string(),
                text: v.string(),
            })
        ),
        workspaceId: v.id('workspaces'),
        translationGroupId: v.optional(v.id('translationGroups')),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (identity === null) {
            throw new Error('Unauthenticated call to mutation');
        }

        const translationId = await ctx.db.insert('translations', {
            name: args.name,
            value: args.value,
            workspaceId: args.workspaceId,
            translationGroupId: args.translationGroupId,
        });

        return translationId;
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

        const variableId = await ctx.db.insert('translationGroups', {
            name: args.name,
            workspaceId: args.workspaceId,
        });

        return variableId;
    },
});

export const setGroup = mutation({
    args: {
        translationId: v.id('translations'),
        translationGroupId: v.id('translationGroups'),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (identity === null) {
            throw new Error('Unauthenticated call to mutation');
        }

        const translationId = await ctx.db.patch(args.translationId, {
            translationGroupId: args.translationGroupId,
        });

        return translationId;
    },
});

export const removeGroup = mutation({
    args: {
        translationId: v.id('translations'),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (identity === null) {
            throw new Error('Unauthenticated call to mutation');
        }

        const translationId = await ctx.db.patch(args.translationId, {
            translationGroupId: undefined,
        });

        return translationId;
    },
});

export const edit = mutation({
    args: {
        translationId: v.id('translations'),
        value: v.array(
            v.object({
                lang: v.string(),
                text: v.string(),
            })
        ),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (identity === null) {
            throw new Error('Unauthenticated call to mutation');
        }

        const variableId = await ctx.db.patch(args.translationId, {
            value: args.value,
        });

        return variableId;
    },
});

export const remove = mutation({
    args: {
        translationId: v.id('translations'),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (identity === null) {
            throw new Error('Unauthenticated call to mutation');
        }

        await ctx.db.delete(args.translationId);
    },
});

export const rename = mutation({
    args: {
        translationId: v.id('translations'),
        name: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (identity === null) {
            throw new Error('Unauthenticated call to mutation');
        }

        const translationId = await ctx.db.patch(args.translationId, {
            name: args.name,
        });

        return translationId;
    },
});
