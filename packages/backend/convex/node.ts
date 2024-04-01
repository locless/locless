import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { metaType, outsidePropType, propType, styleType } from '../constants';

export const getSingle = query({
    args: {
        projectId: v.id('projects'),
        componentId: v.id('components'),
        environmentId: v.id('environments'),
    },
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

        const node = await ctx.db
            .query('nodes')
            .withIndex('by_component_and_environment', q =>
                q.eq('componentId', component._id).eq('environmentId', args.environmentId)
            )
            .first();

        return node;
    },
});

export const getPublic = query({
    args: {
        projectId: v.id('projects'),
        componentId: v.id('components'),
        environmentId: v.id('environments'),
    },
    handler: async (ctx, args) => {
        const project = await ctx.db.get(args.projectId);

        if (!project) {
            return null;
        }

        const component = await ctx.db.get(args.componentId);

        if (component?.projectId !== project._id) {
            return null;
        }

        const node = await ctx.db
            .query('nodes')
            .withIndex('by_component_and_environment', q =>
                q.eq('componentId', component._id).eq('environmentId', args.environmentId)
            )
            .first();

        return node;
    },
});

export const getWithoutProject = query({
    args: {
        componentId: v.id('components'),
        environmentId: v.id('environments'),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (identity === null) {
            throw new Error('Unauthenticated call to mutation');
        }

        const component = await ctx.db.get(args.componentId);

        if (!component) {
            return null;
        }

        const node = await ctx.db
            .query('nodes')
            .withIndex('by_component_and_environment', q =>
                q.eq('componentId', component._id).eq('environmentId', args.environmentId)
            )
            .first();

        return node;
    },
});

export const get = query({
    args: {
        nodeId: v.id('nodes'),
    },
    handler: async (ctx, args) => {
        // TODO: add auth check
        /*const identity = await ctx.auth.getUserIdentity();
        if (identity === null) {
            throw new Error('Unauthenticated call to mutation');
        }*/

        const node = await ctx.db.get(args.nodeId);

        return node;
    },
});

export const getDummyProps = query({
    args: {
        projectId: v.id('projects'),
        componentId: v.id('components'),
        nodeId: v.id('nodes'),
    },
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

        if (!project) {
            return null;
        }

        const component = await ctx.db.get(args.componentId);

        if (component?.projectId !== project._id) {
            return null;
        }

        const node = await ctx.db.get(args.nodeId);

        if (node?.componentId !== component._id) {
            return null;
        }

        const dummyProps = await ctx.db
            .query('nodeDummyProps')
            .withIndex('by_nodes', q => q.eq('nodeId', args.nodeId))
            .first();

        return dummyProps;
    },
});

export const save = mutation({
    args: {
        nodeId: v.optional(v.id('nodes')),
        componentId: v.id('components'),
        environmentId: v.id('environments'),
        styles: v.optional(
            v.array(
                v.object({
                    id: v.string(),
                    styles: v.array(
                        v.object({
                            name: v.string(),
                            type: styleType,
                            value: v.string(),
                            varId: v.optional(v.id('variables')),
                        })
                    ),
                })
            )
        ),
        props: v.optional(
            v.array(
                v.object({
                    id: v.string(),
                    props: v.array(
                        v.object({
                            name: v.string(),
                            type: propType,
                            value: v.string(),
                            varId: v.optional(v.id('variables')),
                            translationId: v.optional(v.id('translations')),
                        })
                    ),
                })
            )
        ),
        meta: v.array(
            v.object({
                id: v.string(),
                name: v.string(),
                type: metaType,
            })
        ),
        layout: v.array(
            v.object({
                id: v.string(),
                value: v.string(),
                connectionId: v.optional(v.id('nodes')),
                canHaveChildren: v.optional(v.boolean()),
                children: v.optional(v.array(v.any())),
            })
        ),
        outsideProps: v.optional(
            v.array(
                v.object({
                    name: v.string(),
                    type: outsidePropType,
                    isServerFetch: v.optional(v.boolean()),
                    defaultValue: v.optional(v.any()),
                })
            )
        ),
        connectedComponents: v.optional(v.array(v.id('nodes'))),
        connectedVariables: v.optional(v.array(v.id('variables'))),
        connectedTranslations: v.optional(v.array(v.id('translations'))),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (identity === null) {
            throw new Error('Unauthenticated call to mutation');
        }

        if (args.nodeId) {
            await ctx.db.patch(args.nodeId, {
                componentId: args.componentId,
                environmentId: args.environmentId,
                styles: args.styles,
                props: args.props,
                meta: args.meta,
                layout: args.layout,
                outsideProps: args.outsideProps,
                connectedComponents: args.connectedComponents,
                connectedVariables: args.connectedVariables,
                connectedTranslations: args.connectedTranslations,
            });

            return args.nodeId;
        } else {
            const nodeId = await ctx.db.insert('nodes', {
                componentId: args.componentId,
                environmentId: args.environmentId,
                styles: args.styles,
                props: args.props,
                meta: args.meta,
                layout: args.layout,
                outsideProps: args.outsideProps,
                connectedComponents: args.connectedComponents,
                connectedVariables: args.connectedVariables,
                connectedTranslations: args.connectedTranslations,
            });

            return nodeId;
        }
    },
});

export const addDummyProp = mutation({
    args: {
        nodeId: v.id('nodes'),
        props: v.optional(
            v.array(
                v.object({
                    name: v.string(),
                    type: outsidePropType,
                    value: v.any(),
                })
            )
        ),
        dummyPropId: v.optional(v.id('nodeDummyProps')),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (identity === null) {
            throw new Error('Unauthenticated call to mutation');
        }

        if (args.dummyPropId && !args.props) {
            return await ctx.db.delete(args.dummyPropId);
        }

        if (args.dummyPropId) {
            return await ctx.db.patch(args.dummyPropId, {
                props: args.props,
            });
        }

        if (args.props) {
            return await ctx.db.insert('nodeDummyProps', {
                nodeId: args.nodeId,
                props: args.props,
            });
        }
    },
});

export const deleteSingle = mutation({
    args: {
        nodeId: v.id('nodes'),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (identity === null) {
            throw new Error('Unauthenticated call to mutation');
        }

        await ctx.db.delete(args.nodeId);

        const dummyProps = await ctx.db
            .query('nodeDummyProps')
            .withIndex('by_nodes', q => q.eq('nodeId', args.nodeId))
            .collect();

        if (dummyProps) {
            dummyProps.forEach(async prop => {
                await ctx.db.delete(prop._id);
            });
        }
    },
});
