import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const getSingle = query({
    args: {
        projectId: v.id('projects'),
        componentId: v.id('components'),
        environment: v.union(v.literal('dev'), v.literal('prod')),
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
                q.eq('componentId', component._id).eq('environment', args.environment)
            )
            .first();

        return node;
    },
});

export const getPublic = query({
    args: {
        projectId: v.id('projects'),
        componentId: v.id('components'),
        environment: v.union(v.literal('dev'), v.literal('prod')),
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
                q.eq('componentId', component._id).eq('environment', args.environment)
            )
            .first();

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
        environment: v.union(v.literal('dev'), v.literal('prod')),
        styles: v.optional(
            v.array(
                v.object({
                    id: v.string(),
                    styles: v.array(
                        v.object({
                            name: v.string(),
                            type: v.union(v.literal('custom'), v.literal('var'), v.literal('outside')),
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
                            type: v.union(
                                v.literal('custom'),
                                v.literal('var'),
                                v.literal('translation'),
                                v.literal('outside')
                            ),
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
                type: v.union(
                    v.literal('textInput'),
                    v.literal('view'),
                    v.literal('activityIndicator'),
                    v.literal('button'),
                    v.literal('checkBox'),
                    v.literal('flatList'),
                    v.literal('image'),
                    v.literal('imageBackground'),
                    v.literal('keyboardAvoidingView'),
                    v.literal('modal'),
                    v.literal('picker'),
                    v.literal('pressable'),
                    v.literal('progressBar'),
                    v.literal('refreshControl'),
                    v.literal('safeAreaView'),
                    v.literal('scrollView'),
                    v.literal('sectionList'),
                    v.literal('statusBar'),
                    v.literal('switch'),
                    v.literal('text'),
                    v.literal('touchable'),
                    v.literal('touchableHighlight'),
                    v.literal('touchableNativeFeedback'),
                    v.literal('touchableOpacity'),
                    v.literal('touchableWithoutFeedback'),
                    v.literal('virtualizedList'),
                    v.literal('touchableOpacity')
                ),
            })
        ),
        layout: v.array(
            v.object({
                id: v.string(),
                value: v.string(),
                connectionId: v.optional(v.id('components')),
                canHaveChildren: v.optional(v.boolean()),
                children: v.optional(v.array(v.any())),
            })
        ),
        outsideProps: v.optional(
            v.array(
                v.object({
                    name: v.string(),
                    type: v.union(
                        v.literal('function'),
                        v.literal('boolean'),
                        v.literal('number'),
                        v.literal('string'),
                        v.literal('object'),
                        v.literal('array'),
                        v.literal('deeplink')
                    ),
                })
            )
        ),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (identity === null) {
            throw new Error('Unauthenticated call to mutation');
        }

        if (args.nodeId) {
            await ctx.db.patch(args.nodeId, {
                componentId: args.componentId,
                environment: args.environment,
                styles: args.styles,
                props: args.props,
                meta: args.meta,
                layout: args.layout,
                outsideProps: args.outsideProps,
            });

            return args.nodeId;
        } else {
            const nodeId = await ctx.db.insert('nodes', {
                componentId: args.componentId,
                environment: args.environment,
                styles: args.styles,
                props: args.props,
                meta: args.meta,
                layout: args.layout,
                outsideProps: args.outsideProps,
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
                    type: v.union(
                        v.literal('function'),
                        v.literal('boolean'),
                        v.literal('number'),
                        v.literal('string'),
                        v.literal('object'),
                        v.literal('array'),
                        v.literal('deeplink')
                    ),
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
