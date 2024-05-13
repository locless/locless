import { StyleSheet } from 'react-native';
import * as React from 'react';
import { createWormhole } from './src/react-lib';

const { Wormhole } = createWormhole({
    verify: async () => true,
});

export default function App() {
    return <Wormhole source={{ componentId: '9a896e45-6d24-4ecd-83f9-ef15cb937f64' }} />;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
