import { Infer, v } from 'convex/values';

// Style types
export const styleType = v.union(v.literal('custom'), v.literal('var'), v.literal('outside'));
export type StyleType = Infer<typeof styleType>;

// Prop types
export const propType = v.union(v.literal('custom'), v.literal('var'), v.literal('translation'), v.literal('outside'));
export type PropType = Infer<typeof propType>;

// OutsideProp types
export const outsidePropType = v.union(
    v.literal('function'),
    v.literal('boolean'),
    v.literal('number'),
    v.literal('string'),
    v.literal('object'),
    v.literal('array'),
    v.literal('deeplink'),
    v.literal('fetch'),
    v.literal('graphql')
);
export type OutsidePropType = Infer<typeof outsidePropType>;
export const outsidePropTypeArray = [
    'function',
    'boolean',
    'number',
    'string',
    'object',
    'array',
    'deeplink',
    'fetch',
    'graphql',
];

// Layout types
export const metaType = v.union(
    v.literal('textInput'),
    v.literal('view'),
    v.literal('activityIndicator'),
    v.literal('button'),
    v.literal('flatList'),
    v.literal('image'),
    v.literal('imageBackground'),
    v.literal('keyboardAvoidingView'),
    v.literal('modal'),
    v.literal('pressable'),
    v.literal('refreshControl'),
    v.literal('safeAreaView'),
    v.literal('scrollView'),
    v.literal('sectionList'),
    v.literal('statusBar'),
    v.literal('switch'),
    v.literal('text'),
    v.literal('touchableHighlight'),
    v.literal('touchableNativeFeedback'),
    v.literal('touchableOpacity'),
    v.literal('touchableWithoutFeedback'),
    v.literal('virtualizedList')
);
export type MetaType = Infer<typeof metaType>;
export const metaTypeArray = [
    'textInput',
    'view',
    'activityIndicator',
    'button',
    'flatList',
    'image',
    'imageBackground',
    'keyboardAvoidingView',
    'modal',
    'pressable',
    'refreshControl',
    'safeAreaView',
    'scrollView',
    'sectionList',
    'statusBar',
    'switch',
    'text',
    'touchableHighlight',
    'touchableNativeFeedback',
    'touchableOpacity',
    'touchableWithoutFeedback',
    'virtualizedList',
];
