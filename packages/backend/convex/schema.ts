import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

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
    variablesGroupWorkspace: defineTable({
        name: v.string(),
        workspaceId: v.id('workspaces'),
    }).index('by_workspace', ['workspaceId']),
    variableWorkspace: defineTable({
        name: v.string(),
        value: v.string(),
        groupId: v.id('variablesGroupWorkspace'),
    }).index('by_group', ['groupId']),
    variableGroups: defineTable({
        name: v.string(),
        projectId: v.id('projects'),
    }).index('by_project', ['projectId']),
    variables: defineTable({
        name: v.string(),
        value: v.string(),
        variableGroupId: v.id('variableGroups'),
        variableWorkspaceId: v.optional(v.id('variableWorkspace')),
    })
        .index('by_group', ['variableGroupId'])
        .index('by_workspace_and_group', ['variableWorkspaceId', 'variableGroupId']),
    translationsGroupWorkspace: defineTable({
        name: v.string(),
        workspaceId: v.id('workspaces'),
    }).index('by_workspace', ['workspaceId']),
    translationsWorkspace: defineTable({
        name: v.string(),
        value: v.string(),
        groupId: v.id('translationsGroupWorkspace'),
    }).index('by_group', ['groupId']),
    translationGroups: defineTable({
        name: v.string(),
        projectId: v.id('projects'),
    }).index('by_project', ['projectId']),
    translations: defineTable({
        name: v.string(),
        value: v.string(),
        translationGroupId: v.id('translationGroups'),
        translationWorkspaceId: v.optional(v.id('translationsWorkspace')),
    })
        .index('by_group', ['translationGroupId'])
        .index('by_workspace_and_group', ['translationWorkspaceId', 'translationGroupId']),
    components: defineTable({
        name: v.string(),
        projectId: v.id('projects'),
    }).index('by_project', ['projectId']),
    nodes: defineTable({
        componentId: v.id('components'),
        environment: v.string(),
        styles: v.optional(
            v.array(
                v.object({
                    id: v.string(),
                    styles: v.array(
                        v.object({
                            name: v.string(),
                            type: v.union(v.literal('custom'), v.literal('var')),
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
                            type: v.union(v.literal('custom'), v.literal('var'), v.literal('translation')),
                            value: v.string(),
                            varId: v.optional(v.id('variables')),
                            translationId: v.optional(v.id('translations')),
                        })
                    ),
                })
            )
        ),
        meta: v.optional(
            v.array(
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
            )
        ),
        layout: v.optional(
            v.array(
                v.object({
                    id: v.string(),
                    value: v.string(),
                    connectionId: v.optional(v.id('components')),
                    canHaveChildren: v.optional(v.boolean()),
                    children: v.optional(v.array(v.any())),
                })
            )
        ),
    }).index('by_component_and_environment', ['componentId', 'environment']),
});
