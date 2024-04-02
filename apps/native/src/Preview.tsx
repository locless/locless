import {
    ActivityIndicator,
    Button,
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    View,
    Image,
    ImageBackground,
    KeyboardAvoidingView,
    Modal,
    Pressable,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    SectionList,
    StatusBar,
    Switch,
    TouchableHighlight,
    TouchableNativeFeedback,
    TouchableOpacity,
    TouchableWithoutFeedback,
    VirtualizedList,
} from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '@repo/backend/convex/_generated/api';
import { Id } from '@repo/backend/convex/_generated/dataModel';
import { useEffect, useState } from 'react';
import NodePreview from './NodePreview';

interface Props {
    componentId: Id<'components'>;
    projectId: Id<'projects'>;
    environmentId: Id<'environments'>;
}

interface ElementNode {
    id: string;
    value: string;
    connectionId?: Id<'nodes'>;
    canHaveChildren?: boolean;
    children?: ElementNode[];
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

interface ElementData {
    id: string;
    type: MetaType;
    name: string;
}

interface ElementStyle {
    name: string;
    type: 'custom' | 'var';
    value: string;
    varId?: Id<'variables'>;
}

interface ElementProp {
    name: string;
    type: 'custom' | 'var' | 'translation';
    value: string;
    varId?: Id<'variables'>;
    translationId?: Id<'translations'>;
}

interface GlobalData {
    nodeId?: Id<'nodes'>;
    styles: Record<string, Record<string, ElementStyle>>;
    props: Record<string, Record<string, ElementProp>>;
    meta: Record<string, ElementData>;
    layout: ElementNode[];
}

const transformMeta = (array?: any[]) => {
    let obj = {};

    if (array) {
        array.forEach(item => {
            obj = { ...obj, [item.id]: item };
        });
    }

    return obj;
};

const transformSubArrays = (array?: any[]) => {
    let obj = {};

    if (array) {
        array.forEach(item => {
            obj = { ...obj, [item.name]: item };
        });
    }

    return obj;
};

const transformStyles = (array?: any[]) => {
    let obj = {};

    if (array) {
        array.forEach(item => {
            obj = { ...obj, [item.id]: transformSubArrays(item.styles) };
        });
    }

    return obj;
};

const transformProps = (array?: any[]) => {
    let obj = {};

    if (array) {
        array.forEach(item => {
            obj = { ...obj, [item.id]: transformSubArrays(item.props) };
        });
    }

    return obj;
};

export default function Preview({ componentId, projectId, environmentId }: Props) {
    const [isLoading, setIsLoading] = useState(true);
    const [componentsData, setComponentsData] = useState<GlobalData>(null);

    const node = useQuery(api.node.getPublic, {
        projectId,
        componentId,
        environmentId,
    });

    useEffect(() => {
        if (node) {
            setIsLoading(true);
            const newData = {
                nodeId: node._id,
                meta: transformMeta(node.meta),
                layout: node.layout as ElementNode[],
                props: transformProps(node.props),
                styles: transformStyles(node.styles),
            };

            setComponentsData(newData);
            setIsLoading(false);
        }
    }, [node]);

    if (node === undefined || isLoading) {
        return <Text>Loading...</Text>;
    }

    if (node === null) {
        return <Text>Not found</Text>;
    }

    return <>{componentsData?.layout.map(c => <NodePreview key={c.id} elementNode={c} parentData={componentsData} />)}</>;
}
