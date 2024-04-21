import { v } from 'convex/values';
import { httpAction, internalMutation } from './_generated/server';
import { Id } from './_generated/dataModel';
import { internal } from './_generated/api';

export const saveFile = internalMutation({
    args: { storageId: v.id('_storage'), projectId: v.id('projects') },
    handler: async (ctx, args) => {
        await ctx.db.insert('files', {
            urlId: args.storageId,
            projectId: args.projectId,
        });
    },
});

export const deleteFile = internalMutation({
    args: {
        storageId: v.id('_storage'),
    },
    handler: async (ctx, args) => {
        return await ctx.storage.delete(args.storageId);
    },
});

export const createUrl = httpAction(async (ctx, request) => {
    const url = await ctx.storage.generateUploadUrl();

    return new Response(url, {
        status: 200,
    });
});

export const saveHTTPFile = httpAction(async (ctx, request) => {
    const { storageId, projectId } = await request.json();

    await ctx.runMutation(internal.files.saveFile, {
        storageId,
        projectId,
    });

    return new Response(null, {
        status: 200,
    });
});

export const getFile = httpAction(async (ctx, request) => {
    const { storageId } = await request.json();

    const url = await ctx.storage.getUrl(storageId as Id<'_storage'>);

    return new Response(JSON.stringify({ url }), {
        status: 200,
    });
});

export const deleteHTTPFile = httpAction(async (ctx, request) => {
    const { storageId } = await request.json();

    await ctx.runMutation(internal.files.deleteFile, {
        storageId,
    });

    return new Response(null, {
        status: 200,
    });
});
