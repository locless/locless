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

interface Props {
    elementNode: ElementNode;
    parentData?: GlobalData;
}

export default function NodePreview({ elementNode, parentData }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<GlobalData>(null);

    const node = useQuery(
        api.node.get,
        elementNode.connectionId
            ? {
                  nodeId: elementNode.connectionId,
              }
            : 'skip'
    );

    const parseStyles = (styles: Record<string, ElementStyle>) => {
        if (!styles) {
            return undefined;
        }

        let parsedStyles: Record<string, any> = {};

        let currentStyle = '';

        Object.entries(styles).forEach(style => {
            currentStyle = style[1].value;

            if (/^\d+$/.test(currentStyle[0] === '-' ? currentStyle.substring(1) : currentStyle)) {
                parsedStyles[style[0]] = Math.max(parseFloat(currentStyle), 0);
            } else if (currentStyle.includes('vh')) {
                parsedStyles[style[0]] =
                    (parseFloat(currentStyle.slice(0, -2)) / 100) * Dimensions.get('screen').height;
            } else if (currentStyle.includes('vw')) {
                parsedStyles[style[0]] = (parseFloat(currentStyle.slice(0, -2)) / 100) * Dimensions.get('screen').width;
            } else if (currentStyle.includes('{')) {
                try {
                    parsedStyles[style[0]] = JSON.parse(currentStyle);
                } catch (_err) {
                    /* empty */
                }
            } else {
                parsedStyles[style[0]] = currentStyle;
            }
        });

        return StyleSheet.create({ root: parsedStyles }).root;
    };

    const parseProps = (props?: Record<string, ElementProp>) => {
        if (!props) {
            return undefined;
        }

        let parsedProps: Record<string, any> = {};

        let currentStyle = '';

        Object.entries(props).forEach(prop => {
            currentStyle = prop[1].value;
            parsedProps[prop[0]] = currentStyle;
        });

        return parsedProps;
    };

    const parseUI = (item: ElementNode, sourceData: GlobalData) => {
        const meta = sourceData.meta[item.id];
        const props = sourceData.props?.[item.id];
        const styles = sourceData.styles?.[item.id];

        if (!meta) {
            return null;
        }

        // TODO: create CheckBox component
        // TODO: check Button component in web
        // TODO: create Picker component if needed
        // TODO: create ProgressBar component
        // TODO: remove Touchable component
        // TODO: check value type because some components cant have string value
        switch (meta.type) {
            case 'textInput':
                return <TextInput key={item.id} style={parseStyles(styles)} {...parseProps(props)} />;
            case 'view':
                return (
                    <View key={item.id} style={parseStyles(styles)} {...parseProps(props)}>
                        {item.children
                            ? item.children.map(c => <NodePreview key={c.id} elementNode={c} parentData={sourceData} />)
                            : null}
                    </View>
                );
            case 'activityIndicator':
                return <ActivityIndicator key={item.id} style={parseStyles(styles)} {...parseProps(props)} />;
            case 'button':
                return (
                    <Button
                        key={item.id}
                        title={props.text?.value ?? ''}
                        color={styles.color?.value}
                        {...parseProps(props)}
                    />
                );
            case 'flatList':
                return (
                    <FlatList
                        key={item.id}
                        style={parseStyles(styles)}
                        data={props.data?.value ?? []}
                        renderItem={(props.renderItem.value as any) ?? null}
                        {...parseProps(props)}
                    />
                );
            case 'image':
                return <Image key={item.id} style={parseStyles(styles)} {...parseProps(props)} />;
            case 'imageBackground':
                return (
                    <ImageBackground key={item.id} style={parseStyles(styles)} {...parseProps(props)}>
                        {item.children
                            ? item.children.map(c => <NodePreview key={c.id} elementNode={c} parentData={sourceData} />)
                            : null}
                    </ImageBackground>
                );
            case 'keyboardAvoidingView':
                return (
                    <KeyboardAvoidingView key={item.id} style={parseStyles(styles)} {...parseProps(props)}>
                        {item.children
                            ? item.children.map(c => <NodePreview key={c.id} elementNode={c} parentData={sourceData} />)
                            : null}
                    </KeyboardAvoidingView>
                );
            case 'modal':
                return (
                    <Modal key={item.id} style={parseStyles(styles)} {...parseProps(props)}>
                        {item.children
                            ? item.children.map(c => <NodePreview key={c.id} elementNode={c} parentData={sourceData} />)
                            : null}
                    </Modal>
                );
            case 'pressable':
                return (
                    <Pressable key={item.id} style={parseStyles(styles)} {...parseProps(props)}>
                        {item.children
                            ? item.children.map(c => <NodePreview key={c.id} elementNode={c} parentData={sourceData} />)
                            : null}
                    </Pressable>
                );
            case 'refreshControl':
                return (
                    <RefreshControl
                        key={item.id}
                        style={parseStyles(styles)}
                        refreshing={!!props.refreshing?.value ?? false}
                        {...parseProps(props)}
                    />
                );
            case 'safeAreaView':
                return (
                    <SafeAreaView key={item.id} style={parseStyles(styles)} {...parseProps(props)}>
                        {item.children
                            ? item.children.map(c => <NodePreview key={c.id} elementNode={c} parentData={sourceData} />)
                            : null}
                    </SafeAreaView>
                );
            case 'scrollView':
                return (
                    <ScrollView key={item.id} style={parseStyles(styles)} {...parseProps(props)}>
                        {item.children
                            ? item.children.map(c => <NodePreview key={c.id} elementNode={c} parentData={sourceData} />)
                            : null}
                    </ScrollView>
                );
            case 'sectionList':
                return (
                    <SectionList
                        key={item.id}
                        style={parseStyles(styles)}
                        sections={(props.sections?.value as any) ?? []}
                        {...parseProps(props)}
                    />
                );
            case 'statusBar':
                return <StatusBar key={item.id} {...parseProps(props)} />;
            case 'switch':
                return <Switch key={item.id} style={parseStyles(styles)} {...parseProps(props)} />;
            case 'text':
                return (
                    <Text key={item.id} style={parseStyles(styles)} {...parseProps(props)}>
                        {props?.text?.value ?? ''}
                        {item.children
                            ? item.children.map(c => <NodePreview key={c.id} elementNode={c} parentData={sourceData} />)
                            : null}
                    </Text>
                );
            case 'touchableHighlight':
                return (
                    <TouchableHighlight key={item.id} style={parseStyles(styles)} {...parseProps(props)}>
                        {item.children
                            ? item.children.map(c => <NodePreview key={c.id} elementNode={c} parentData={sourceData} />)
                            : null}
                    </TouchableHighlight>
                );
            case 'touchableNativeFeedback':
                return (
                    <TouchableNativeFeedback key={item.id} style={parseStyles(styles)} {...parseProps(props)}>
                        {item.children
                            ? item.children.map(c => <NodePreview key={c.id} elementNode={c} parentData={sourceData} />)
                            : null}
                    </TouchableNativeFeedback>
                );
            case 'touchableOpacity':
                return (
                    <TouchableOpacity key={item.id} style={parseStyles(styles)} {...parseProps(props)}>
                        {item.children
                            ? item.children.map(c => <NodePreview key={c.id} elementNode={c} parentData={sourceData} />)
                            : null}
                    </TouchableOpacity>
                );
            case 'touchableWithoutFeedback':
                return (
                    <TouchableWithoutFeedback key={item.id} style={parseStyles(styles)} {...parseProps(props)}>
                        {item.children
                            ? item.children.map(c => <NodePreview key={c.id} elementNode={c} parentData={sourceData} />)
                            : null}
                    </TouchableWithoutFeedback>
                );
            case 'virtualizedList':
                return (
                    <VirtualizedList
                        key={item.id}
                        style={parseStyles(styles)}
                        data={props.data?.value ?? []}
                        renderItem={(props.renderItem.value as any) ?? null}
                        {...parseProps(props)}
                    />
                );
            default:
                return null;
        }
    };

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

            setData(newData);
            setIsLoading(false);
        }
    }, [node]);

    if (isLoading) {
        return <Text>Loading...</Text>;
    }

    return (
        <>
            {elementNode.connectionId ? (
                <>{data ? data.layout.map(c => <NodePreview key={c.id} elementNode={c} parentData={data} />) : null}</>
            ) : (
                parseUI(elementNode, parentData ?? data)
            )}
        </>
    );
}
