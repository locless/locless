import { useMemo, useState, useEffect } from 'react';
import { Animated, Alert, TouchableOpacity } from 'react-native';

interface Props {
    onPressCallback: () => void;
}

function CustomButton({ onPressCallback }: Props) {
    return (
        <TouchableOpacity onPress={() => onPressCallback()}>
            <Animated.Text children='Click here!' />
        </TouchableOpacity>
    );
}

export default function ServerComponent() {
    const message = useMemo(() => 'Hello, world!', []);

    const [state, setState] = useState<string | null>(null);

    const onPressCallback = () => {
        Alert.alert('You clicked the button!');
        setState(s => s === 'green' ? 'red' : 'green');
    };

    useEffect(() => {
        Alert.alert('Component mounted!');
    }, []);

    return (
        <Animated.View style={{ flex: 1, backgroundColor: state ?? 'red' }}>
            <Animated.Text>{message}</Animated.Text>
            <CustomButton onPressCallback={onPressCallback} />
        </Animated.View>
    );
}
