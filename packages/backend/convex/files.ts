import { v } from 'convex/values';
import { httpAction, mutation } from './_generated/server';
import { Id } from './_generated/dataModel';

export const createUrl = mutation({
    args: {},
    handler: async (ctx, args) => {
        return await ctx.storage.generateUploadUrl();
    },
});

export const saveFile = mutation({
    args: { storageId: v.id('_storage'), projectId: v.id('projects') },
    handler: async (ctx, args) => {
        await ctx.db.insert('files', {
            urlId: args.storageId,
            projectId: args.projectId,
        });
    },
});

export const getFile = httpAction(async (ctx, request) => {
    const { storageId } = await request.json();

    const url = await ctx.storage.getUrl(storageId as Id<'_storage'>);

    return new Response(JSON.stringify({ url }), {
        status: 200,
    });
});
