import { StyleSheet } from 'react-native';
import * as React from 'react';
import { createWormhole } from './src/wormhole';

const { Wormhole } = createWormhole({
    verify: async () => true,
});

export default function App() {
    return <Wormhole source={{ componentId: '1265e370-3b02-4266-9388-c6bbfd69b1d9' }} />;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
