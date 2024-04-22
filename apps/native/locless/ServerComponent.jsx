import * as React from 'react';
import { Animated, Alert, TouchableOpacity } from 'react-native';

function CustomButton() {
    return (
        <TouchableOpacity onPress={() => Alert.alert('Hi!')}>
            <Animated.Text children='Click here!' />
        </TouchableOpacity>
    );
}

export default function ServerComponent() {
    const message = React.useMemo(() => 'Hello, world!', []);
    return (
        <Animated.View style={{ flex: 1, backgroundColor: 'red' }}>
            <Animated.Text>{message}</Animated.Text>
            <CustomButton />
        </Animated.View>
    );
}
