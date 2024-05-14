import * as React from 'react';
import { createWormhole } from './src/react-lib';

const { Wormhole } = createWormhole();

export default function App() {
    return <Wormhole source={{ componentId: '9a896e45-6d24-4ecd-83f9-ef15cb937f64' }} />;
}
