import { paginationOptsValidator } from 'convex/server';
import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const get = query({
    args: { paginationOpts: paginationOptsValidator, componentId: v.id('components') },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (identity === null) {
            throw new Error('Unauthenticated call to query');
        }

        return await ctx.db
            .query('environments')
            .withIndex('by_component', q => q.eq('componentId', args.componentId))
            .order('desc')
            .paginate(args.paginationOpts);
    },
});

export const create = mutation({
    args: { name: v.string(), componentId: v.id('components') },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (identity === null) {
            throw new Error('Unauthenticated call to query');
        }

        const environmentId = await ctx.db.insert('environments', {
            componentId: args.componentId,
            name: args.name,
        });

        return await ctx.db.get(environmentId);
    },
});
