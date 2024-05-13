import { useMemo, useState, useEffect } from 'react';
import { Animated, Alert, TouchableOpacity } from 'react-native';

interface Props {
    count: number;
    onPressCallback: () => void;
}

function CustomButton({ count, onPressCallback }: Props) {
    return (
        <TouchableOpacity onPress={() => onPressCallback()}>
            <Animated.Text children={`Click here! Clicks: ${count}`} />
        </TouchableOpacity>
    );
}

export default function ServerComponent() {
    const message = useMemo(() => 'Hello, world!', []);

    const [state, setState] = useState<string | null>(null);
    const [count, setCount] = useState(0);

    const onPressCallback = () => {
        Alert.alert('You clicked the button!');
        setState(s => (s === 'green' ? 'red' : 'green'));
        setCount(s => s + 1);
    };

    useEffect(() => {
        Alert.alert('Component mounted!');
    }, []);

    return (
        <Animated.View
            style={{ flex: 1, backgroundColor: state ?? 'red', justifyContent: 'center', alignItems: 'center' }}>
            <Animated.Text>{message}</Animated.Text>
            <CustomButton onPressCallback={onPressCallback} count={count} />
        </Animated.View>
    );
}
