'use client';
import { View } from 'react-native-web';
import useEditor from './useEditor';
import ReactNativeNode from './react-native-node';

export default function ReactNativeApp() {
    const { componentsData, frameItem } = useEditor();

    if (!frameItem) {
        return null;
    }

    return (
        <View style={frameItem.styles}>
            {componentsData.layout.map(c => (
                <ReactNativeNode key={c.id} elementNode={c} />
            ))}
        </View>
    );
}
