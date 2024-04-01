import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { metaType, outsidePropType, propType, styleType } from '../constants';

export default defineSchema({
    projects: defineTable({
        workspaceId: v.id('workspaces'),
        name: v.string(),
        deletedAt: v.optional(v.number()),
        keyAuth: v.optional(v.string()),
    })
        .index('by_workspaces', ['workspaceId'])
        .searchIndex('search_name', {
            searchField: 'name',
        }),
    workspaces: defineTable({
        name: v.string(),
        tenantId: v.string(),
        isPersonal: v.boolean(),
        plan: v.union(v.literal('free'), v.literal('pro'), v.literal('enterprise')),
        deletedAt: v.optional(v.number()),
    }).index('by_token', ['tenantId']),
    variableGroups: defineTable({
        name: v.string(),
        workspaceId: v.optional(v.id('workspaces')),
        projectId: v.optional(v.id('projects')),
    })
        .index('by_project', ['projectId'])
        .index('by_workspace', ['workspaceId']),
    variables: defineTable({
        name: v.string(),
        value: v.string(),
        workspaceId: v.optional(v.id('workspaces')),
        projectId: v.optional(v.id('projects')),
        variableGroupId: v.optional(v.id('variableGroups')),
    })
        .index('by_group', ['variableGroupId'])
        .index('by_project', ['projectId'])
        .index('by_workspace', ['workspaceId'])
        .index('by_workspace_and_group', ['workspaceId', 'variableGroupId'])
        .index('by_project_and_group', ['projectId', 'variableGroupId']),
    translationGroups: defineTable({
        name: v.string(),
        workspaceId: v.optional(v.id('workspaces')),
        projectId: v.optional(v.id('projects')),
    })
        .index('by_project', ['projectId'])
        .index('by_workspace', ['workspaceId']),
    translations: defineTable({
        name: v.string(),
        value: v.array(
            v.object({
                lang: v.string(),
                text: v.string(),
            })
        ),
        workspaceId: v.optional(v.id('workspaces')),
        projectId: v.optional(v.id('projects')),
        translationGroupId: v.optional(v.id('translationGroups')),
    })
        .index('by_group', ['translationGroupId'])
        .index('by_project', ['projectId'])
        .index('by_workspace', ['workspaceId'])
        .index('by_workspace_and_group', ['workspaceId', 'translationGroupId'])
        .index('by_project_and_group', ['projectId', 'translationGroupId']),
    components: defineTable({
        name: v.string(),
        projectId: v.id('projects'),
    }).index('by_project', ['projectId']),
    environments: defineTable({
        name: v.string(),
        componentId: v.id('components'),
    }).index('by_component', ['componentId']),
    nodes: defineTable({
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
        connectedComponents: v.optional(v.array(v.id('nodes'))),
        connectedVariables: v.optional(v.array(v.id('variables'))),
        connectedTranslations: v.optional(v.array(v.id('translations'))),
    }).index('by_component_and_environment', ['componentId', 'environmentId']),
    nodeDummyProps: defineTable({
        props: v.array(
            v.object({
                name: v.string(),
                type: outsidePropType,
                value: v.any(),
            })
        ),
        nodeId: v.id('nodes'),
    }).index('by_nodes', ['nodeId']),
});
