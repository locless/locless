'use client';
import {
    TextInput,
    View,
    ActivityIndicator,
    Button,
    FlatList,
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
    Text,
    TouchableHighlight,
    TouchableNativeFeedback,
    TouchableOpacity,
    TouchableWithoutFeedback,
    VirtualizedList,
    StyleSheet,
} from 'react-native-web';
import useEditor, { DummyProp, ElementNode, ElementProp, ElementStyle, GlobalData } from './useEditor';
import { fetchQuery } from 'convex/nextjs';
import { useEffect, useState } from 'react';
import { Id } from '@repo/backend/convex/_generated/dataModel';
import { api } from '@repo/backend/convex/_generated/api';
import { transformMeta, transformProps, transformStyles } from './utils';

interface Props {
    elementNode: ElementNode;
    parentData?: GlobalData;
}

export default function ReactNativeNode({ elementNode, parentData }: Props) {
    const { componentsData, frameItem, dummyProps } = useEditor();

    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<GlobalData | undefined>(undefined);

    const fetchInternalComponent = async (nodeId: Id<'nodes'>) => {
        setIsLoading(true);
        const node = await fetchQuery(api.node.get, {
            nodeId,
        });

        if (node) {
            const newData = {
                nodeId: node._id,
                meta: transformMeta(node.meta),
                layout: node.layout as ElementNode[],
                props: transformProps(node.props),
                styles: transformStyles(node.styles),
                outsideProps: node.outsideProps,
            };

            setData(newData);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (elementNode.connectionId) {
            fetchInternalComponent(elementNode.connectionId);
        }
    }, [elementNode]);

    const parseStyles = (styles?: Record<string, ElementStyle>) => {
        if (!styles) {
            return undefined;
        }

        let parsedStyles: Record<string, any> = {};

        let currentStyle = '';

        let dummyProp: DummyProp | undefined = undefined;

        Object.entries(styles).forEach(style => {
            if (style[1].type === 'outside') {
                if (dummyProps?.length) {
                    dummyProp = dummyProps.find(p => p.name === style[1].value);

                    if (dummyProp) {
                        parsedStyles[style[0]] = dummyProp.value;
                    }
                }
            } else {
                currentStyle = style[1].value;

                if (/^\d+$/.test(currentStyle.replaceAll('-', '').replaceAll('.', ''))) {
                    parsedStyles[style[0]] = parseFloat(currentStyle);
                } else if (currentStyle.includes('vh')) {
                    parsedStyles[style[0]] = (parseFloat(currentStyle.slice(0, -2)) / 100) * frameItem?.styles.height;
                } else if (currentStyle.includes('vw')) {
                    parsedStyles[style[0]] = (parseFloat(currentStyle.slice(0, -2)) / 100) * frameItem?.styles.width;
                } else if (currentStyle.includes('{')) {
                    try {
                        parsedStyles[style[0]] = JSON.parse(currentStyle);
                    } catch (_err) {
                        /* empty */
                    }
                } else {
                    parsedStyles[style[0]] = currentStyle;
                }
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

        let dummyProp: DummyProp | undefined = undefined;

        Object.entries(props).forEach(prop => {
            if (prop[1].type === 'outside') {
                if (dummyProps?.length) {
                    dummyProp = dummyProps.find(p => p.name === prop[1].value);

                    if (dummyProp) {
                        parsedProps[prop[0]] = dummyProp.value;
                    }
                }
            } else {
                currentStyle = prop[1].value;
                parsedProps[prop[0]] = currentStyle;
            }
        });

        return parsedProps;
    };

    const parseUI = (item: ElementNode) => {
        const meta = (parentData ?? componentsData).meta[item.id];
        const props = (parentData ?? componentsData).props?.[item.id];
        const styles = (parentData ?? componentsData).styles?.[item.id];

        if (!meta) {
            return null;
        }

        switch (meta.type) {
            case 'textInput':
                return <TextInput key={item.id} style={parseStyles(styles)} {...parseProps(props)} />;
            case 'view':
                return (
                    <View key={item.id} style={parseStyles(styles)} {...parseProps(props)}>
                        {item.children
                            ? item.children.map(c => <ReactNativeNode key={c.id} elementNode={c} parentData={data} />)
                            : null}
                    </View>
                );
            case 'activityIndicator':
                return <ActivityIndicator key={item.id} style={parseStyles(styles)} {...parseProps(props)} />;
            case 'button':
                return (
                    <Button key={item.id} style={parseStyles(styles)} {...parseProps(props)}>
                        {item.children
                            ? item.children.map(c => <ReactNativeNode key={c.id} elementNode={c} parentData={data} />)
                            : null}
                    </Button>
                );
            case 'flatList':
                return <FlatList key={item.id} style={parseStyles(styles)} {...parseProps(props)} />;
            case 'image':
                return <Image key={item.id} style={parseStyles(styles)} {...parseProps(props)} alt={item.id} />;
            case 'imageBackground':
                return (
                    <ImageBackground key={item.id} style={parseStyles(styles)} {...parseProps(props)}>
                        {item.children
                            ? item.children.map(c => <ReactNativeNode key={c.id} elementNode={c} parentData={data} />)
                            : null}
                    </ImageBackground>
                );
            case 'keyboardAvoidingView':
                return (
                    <KeyboardAvoidingView key={item.id} style={parseStyles(styles)} {...parseProps(props)}>
                        {item.children
                            ? item.children.map(c => <ReactNativeNode key={c.id} elementNode={c} parentData={data} />)
                            : null}
                    </KeyboardAvoidingView>
                );
            case 'modal':
                return (
                    <Modal key={item.id} style={parseStyles(styles)} {...parseProps(props)}>
                        {item.children
                            ? item.children.map(c => <ReactNativeNode key={c.id} elementNode={c} parentData={data} />)
                            : null}
                    </Modal>
                );
            case 'pressable':
                return (
                    <Pressable key={item.id} style={parseStyles(styles)} {...parseProps(props)}>
                        {item.children
                            ? item.children.map(c => <ReactNativeNode key={c.id} elementNode={c} parentData={data} />)
                            : null}
                    </Pressable>
                );
            case 'refreshControl':
                return <RefreshControl key={item.id} style={parseStyles(styles)} {...parseProps(props)} />;
            case 'safeAreaView':
                return (
                    <SafeAreaView key={item.id} style={parseStyles(styles)} {...parseProps(props)}>
                        {item.children
                            ? item.children.map(c => <ReactNativeNode key={c.id} elementNode={c} parentData={data} />)
                            : null}
                    </SafeAreaView>
                );
            case 'scrollView':
                return (
                    <ScrollView key={item.id} style={parseStyles(styles)} {...parseProps(props)}>
                        {item.children
                            ? item.children.map(c => <ReactNativeNode key={c.id} elementNode={c} parentData={data} />)
                            : null}
                    </ScrollView>
                );
            case 'sectionList':
                return <SectionList key={item.id} style={parseStyles(styles)} {...parseProps(props)} />;
            case 'statusBar':
                return <StatusBar key={item.id} style={parseStyles(styles)} {...parseProps(props)} />;
            case 'switch':
                return <Switch key={item.id} style={parseStyles(styles)} {...parseProps(props)} />;
            case 'text':
                return (
                    <Text key={item.id} style={parseStyles(styles)} {...parseProps(props)}>
                        {props?.text?.value ?? ''}
                        {item.children
                            ? item.children.map(c => <ReactNativeNode key={c.id} elementNode={c} parentData={data} />)
                            : null}
                    </Text>
                );
            case 'touchableHighlight':
                return (
                    <TouchableHighlight key={item.id} style={parseStyles(styles)} {...parseProps(props)}>
                        {item.children
                            ? item.children.map(c => <ReactNativeNode key={c.id} elementNode={c} parentData={data} />)
                            : null}
                    </TouchableHighlight>
                );
            case 'touchableNativeFeedback':
                return (
                    <TouchableNativeFeedback key={item.id} style={parseStyles(styles)} {...parseProps(props)}>
                        {item.children
                            ? item.children.map(c => <ReactNativeNode key={c.id} elementNode={c} parentData={data} />)
                            : null}
                    </TouchableNativeFeedback>
                );
            case 'touchableOpacity':
                return (
                    <TouchableOpacity key={item.id} style={parseStyles(styles)} {...parseProps(props)}>
                        {item.children
                            ? item.children.map(c => <ReactNativeNode key={c.id} elementNode={c} parentData={data} />)
                            : null}
                    </TouchableOpacity>
                );
            case 'touchableWithoutFeedback':
                return (
                    <TouchableWithoutFeedback key={item.id} style={parseStyles(styles)} {...parseProps(props)}>
                        {item.children
                            ? item.children.map(c => <ReactNativeNode key={c.id} elementNode={c} parentData={data} />)
                            : null}
                    </TouchableWithoutFeedback>
                );
            case 'virtualizedList':
                return <VirtualizedList key={item.id} style={parseStyles(styles)} {...parseProps(props)} />;
            default:
                return null;
        }
    };

    if (isLoading) {
        return <Text>Loading</Text>;
    }

    return (
        <>
            {elementNode.connectionId ? (
                <>
                    {data
                        ? data.layout.map(c => <ReactNativeNode key={c.id} elementNode={c} parentData={data} />)
                        : null}
                </>
            ) : (
                parseUI(elementNode)
            )}
        </>
    );
}
