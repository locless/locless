import {
    TextInput,
    View,
    ActivityIndicator,
    Button,
    CheckBox,
    FlatList,
    Image,
    ImageBackground,
    KeyboardAvoidingView,
    Modal,
    Picker,
    Pressable,
    ProgressBar,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    SectionList,
    StatusBar,
    Switch,
    Text,
    Touchable,
    TouchableHighlight,
    TouchableNativeFeedback,
    TouchableOpacity,
    TouchableWithoutFeedback,
    VirtualizedList,
    StyleSheet,
} from 'react-native-web';
import useEditor, { ElementNode, ElementProp, ElementStyle } from './useEditor';

export default function ReactNativeApp() {
    const { componentsData, frameItem } = useEditor();

    const parseStyles = (styles: Record<string, ElementStyle>) => {
        let parsedStyles: Record<string, any> = {};

        let currentStyle = '';

        Object.entries(styles).forEach(style => {
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
        });

        return StyleSheet.create({ root: parsedStyles }).root;
    };

    const parseProps = (props: Record<string, ElementProp>) => {
        let parsedProps: Record<string, any> = {};

        let currentStyle = '';

        Object.entries(props).forEach(prop => {
            currentStyle = prop[1].value;
            parsedProps[prop[0]] = currentStyle;
        });

        return parsedProps;
    };

    const parseUI = (item: ElementNode) => {
        const meta = componentsData.meta[item.id];
        const props = componentsData.props[item.id];
        const styles = componentsData.styles[item.id];

        if (!meta || !styles || !props) {
            return null;
        }

        switch (meta.type) {
            case 'textInput':
                return <TextInput key={item.id} style={parseStyles(styles)} {...parseProps(props)} />;
            case 'view':
                return (
                    <View key={item.id} style={parseStyles(styles)} {...parseProps(props)}>
                        {item.children ? item.children.map(c => parseUI(c)) : null}
                    </View>
                );
            case 'activityIndicator':
                return <ActivityIndicator key={item.id} style={parseStyles(styles)} {...parseProps(props)} />;
            case 'button':
                return (
                    <Button key={item.id} style={parseStyles(styles)} {...parseProps(props)}>
                        {item.children ? item.children.map(c => parseUI(c)) : null}
                    </Button>
                );
            case 'checkBox':
                return <CheckBox key={item.id} style={parseStyles(styles)} {...parseProps(props)} />;
            case 'flatList':
                return <FlatList key={item.id} style={parseStyles(styles)} {...parseProps(props)} />;
            case 'image':
                return <Image key={item.id} style={parseStyles(styles)} {...parseProps(props)} alt={item.id} />;
            case 'imageBackground':
                return (
                    <ImageBackground key={item.id} style={parseStyles(styles)} {...parseProps(props)}>
                        {item.children ? item.children.map(c => parseUI(c)) : null}
                    </ImageBackground>
                );
            case 'keyboardAvoidingView':
                return (
                    <KeyboardAvoidingView key={item.id} style={parseStyles(styles)} {...parseProps(props)}>
                        {item.children ? item.children.map(c => parseUI(c)) : null}
                    </KeyboardAvoidingView>
                );
            case 'modal':
                return (
                    <Modal key={item.id} style={parseStyles(styles)} {...parseProps(props)}>
                        {item.children ? item.children.map(c => parseUI(c)) : null}
                    </Modal>
                );
            case 'picker':
                return (
                    <Picker key={item.id} style={parseStyles(styles)} {...parseProps(props)}>
                        {item.children ? item.children.map(c => parseUI(c)) : null}
                    </Picker>
                );
            case 'pressable':
                return (
                    <Pressable key={item.id} style={parseStyles(styles)} {...parseProps(props)}>
                        {item.children ? item.children.map(c => parseUI(c)) : null}
                    </Pressable>
                );
            case 'progressBar':
                return <ProgressBar key={item.id} style={parseStyles(styles)} {...parseProps(props)} />;
            case 'refreshControl':
                return <RefreshControl key={item.id} style={parseStyles(styles)} {...parseProps(props)} />;
            case 'safeAreaView':
                return (
                    <SafeAreaView key={item.id} style={parseStyles(styles)} {...parseProps(props)}>
                        {item.children ? item.children.map(c => parseUI(c)) : null}
                    </SafeAreaView>
                );
            case 'scrollView':
                return (
                    <ScrollView key={item.id} style={parseStyles(styles)} {...parseProps(props)}>
                        {item.children ? item.children.map(c => parseUI(c)) : null}
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
                        {props.text?.value ?? ''}
                        {item.children ? item.children.map(c => parseUI(c)) : null}
                    </Text>
                );
            case 'touchable':
                return (
                    <Touchable key={item.id} style={parseStyles(styles)} {...parseProps(props)}>
                        {item.children ? item.children.map(c => parseUI(c)) : null}
                    </Touchable>
                );
            case 'touchableHighlight':
                return (
                    <TouchableHighlight key={item.id} style={parseStyles(styles)} {...parseProps(props)}>
                        {item.children ? item.children.map(c => parseUI(c)) : null}
                    </TouchableHighlight>
                );
            case 'touchableNativeFeedback':
                return (
                    <TouchableNativeFeedback key={item.id} style={parseStyles(styles)} {...parseProps(props)}>
                        {item.children ? item.children.map(c => parseUI(c)) : null}
                    </TouchableNativeFeedback>
                );
            case 'touchableOpacity':
                return (
                    <TouchableOpacity key={item.id} style={parseStyles(styles)} {...parseProps(props)}>
                        {item.children ? item.children.map(c => parseUI(c)) : null}
                    </TouchableOpacity>
                );
            case 'touchableWithoutFeedback':
                return (
                    <TouchableWithoutFeedback key={item.id} style={parseStyles(styles)} {...parseProps(props)}>
                        {item.children ? item.children.map(c => parseUI(c)) : null}
                    </TouchableWithoutFeedback>
                );
            case 'virtualizedList':
                return <VirtualizedList key={item.id} style={parseStyles(styles)} {...parseProps(props)} />;
            default:
                return null;
        }
    };

    if (!frameItem) {
        return null;
    }

    return <View style={frameItem.styles}>{componentsData.layout.map(c => parseUI(c))}</View>;
}
