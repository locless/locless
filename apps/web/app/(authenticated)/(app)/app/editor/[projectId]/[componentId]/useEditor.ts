import { Id } from '@repo/backend/convex/_generated/dataModel';
import { create } from 'zustand';

export interface ElementNode {
    id: string;
    value: string;
    connectionId?: Id<'components'>;
    canHaveChildren?: boolean;
    children?: ElementNode[];
}

export interface ElementNodeWithData extends ElementNode {
    type: string;
    styles: Record<string, any>;
    props: Record<string, any>;
}

export type MetaType =
    | 'textInput'
    | 'view'
    | 'activityIndicator'
    | 'button'
    | 'checkBox'
    | 'flatList'
    | 'image'
    | 'imageBackground'
    | 'keyboardAvoidingView'
    | 'modal'
    | 'picker'
    | 'pressable'
    | 'progressBar'
    | 'refreshControl'
    | 'safeAreaView'
    | 'scrollView'
    | 'sectionList'
    | 'statusBar'
    | 'switch'
    | 'text'
    | 'touchable'
    | 'touchableHighlight'
    | 'touchableNativeFeedback'
    | 'touchableOpacity'
    | 'touchableWithoutFeedback'
    | 'virtualizedList'
    | 'touchableOpacity';

export interface ElementData {
    id: string;
    type: MetaType;
    name: string;
}

export type TabType = 'frames' | 'styles' | 'interactions';

export interface ElementStyle {
    name: string;
    type: 'custom' | 'var' | 'outside';
    value: string;
    varId?: Id<'variables'>;
}

export interface ElementProp {
    name: string;
    type: 'custom' | 'var' | 'translation' | 'outside';
    value: string;
    varId?: Id<'variables'>;
    translationId?: Id<'translations'>;
}

export type DummyPropType = 'string' | 'number' | 'boolean' | 'object' | 'function' | 'array' | 'deeplink';

export interface OutsideProp {
    name: string;
    type: DummyPropType;
}

export interface GlobalData {
    nodeId?: Id<'nodes'>;
    styles?: Record<string, Record<string, ElementStyle>>;
    props?: Record<string, Record<string, ElementProp>>;
    meta: Record<string, ElementData>;
    layout: ElementNode[];
    outsideProps?: OutsideProp[];
}

export interface DummyProp {
    name: string;
    type: DummyPropType;
    value: any;
}

interface EditorState {
    componentsData: GlobalData;
    activeTabType: TabType;
    frameItem?: ElementNodeWithData;
    activeItem?: string;
    isSaveAllowed: boolean;
    dummyPropsId?: Id<'nodeDummyProps'>;
    dummyProps?: DummyProp[];
    updateSaveButton: (val: boolean) => void;
    updateTab: (newType: TabType) => void;
    updateFrameItem: (el: ElementNodeWithData) => void;
    updateActiveItem: (id: string) => void;
    updateStyles: (id: string, styles: Record<string, ElementStyle>) => void;
    updateProps: (id: string, props: Record<string, ElementProp>) => void;
    addToLayout: (item: ElementNode) => void;
    updateLayout: (layout: ElementNode[]) => void;
    updateMeta: (id: string, meta: ElementData) => void;
    updateOutsideProp: (prop: OutsideProp) => void;
    clearActiveItem: () => void;
    loadComponentsData: (componentsData: GlobalData) => void;
    loadDummyPropsId: (dummyPropsId: Id<'nodeDummyProps'>) => void;
    loadDummyProps: (dummyProps?: DummyProp[]) => void;
}

const useEditor = create<EditorState>(set => ({
    componentsData: {
        nodeId: undefined,
        styles: {},
        props: {},
        meta: {},
        layout: [],
        outsideProps: [],
    },
    dummyProps: undefined,
    isSaveAllowed: false,
    activeTabType: 'frames',
    frameItem: undefined,
    activeItem: undefined,
    updateSaveButton: val => set({ isSaveAllowed: val }),
    updateTab: newType => set({ activeTabType: newType }),
    updateFrameItem: el => set({ frameItem: el }),
    updateActiveItem: id => set({ activeItem: id }),
    clearActiveItem: () => set({ activeItem: undefined }),
    updateStyles: (id, styles) =>
        set(state => ({
            componentsData: { ...state.componentsData, styles: { ...state.componentsData.styles, [id]: styles } },
        })),
    updateProps: (id, props) =>
        set(state => ({
            componentsData: { ...state.componentsData, props: { ...state.componentsData.props, [id]: props } },
        })),
    addToLayout: item =>
        set(state => ({
            componentsData: { ...state.componentsData, layout: [...state.componentsData.layout, item] },
        })),
    updateLayout: layout => set(state => ({ componentsData: { ...state.componentsData, layout } })),
    updateMeta: (id, meta) =>
        set(state => ({
            componentsData: { ...state.componentsData, meta: { ...state.componentsData.meta, [id]: meta } },
        })),
    updateOutsideProp: prop =>
        set(state => ({
            componentsData: {
                ...state.componentsData,
                outsideProps: [...(state.componentsData.outsideProps ?? []), prop],
            },
        })),
    loadComponentsData: componentsData => set({ componentsData }),
    loadDummyPropsId: dummyPropsId => set({ dummyPropsId }),
    loadDummyProps: dummyProps => set({ dummyProps }),
}));

export default useEditor;
