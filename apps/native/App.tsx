import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { StyleSheet, View, Text } from 'react-native';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ConvexReactClient } from 'convex/react';
import 'react-native-get-random-values';
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera/next';
import * as React from 'react';
import { Id } from '@repo/backend/convex/_generated/dataModel';
import Preview from './src/Preview';
import { createWormhole } from './wormhole';

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL, {
    unsavedChangesWarning: false,
});

const { Wormhole } = createWormhole({
    verify: async () => true,
    global: {
        require: (moduleId: string) => {
            if (moduleId === 'react') {
                return require('react');
            } else if (moduleId === 'react-native') {
                return require('react-native');
            } else if (moduleId === 'react/jsx-runtime') {
                return require('react/jsx-runtime');
            }
            return null;
        },
    },
});

export default function App() {
    const [_permission, requestPermission] = useCameraPermissions();
    const [didScan, setDidScan] = React.useState(false);
    const [componentId, setComponentId] = React.useState<Id<'components'> | null>(null);
    const [projectId, setProjectId] = React.useState<Id<'projects'> | null>(null);
    const [environmentId, setEnvironmentId] = React.useState<Id<'environments'> | null>(null);

    const [fileUrl, setFileUrl] = React.useState<string | null>(null);

    const handleBarcodeScanned = (scanningResult: BarcodeScanningResult) => {
        if (didScan) {
            return;
        }

        try {
            const data = JSON.parse(scanningResult.data);
            setComponentId(data.componentId);
            setProjectId(data.projectId);
            setEnvironmentId(data.environmentId);
        } catch (e) {
            console.error(e);
        }

        setDidScan(true);
    };

    const getFileUrl = async () => {
        const response = await fetch('https://robust-dalmatian-29.convex.site/serveFile', {
            method: 'POST',
            body: JSON.stringify({ storageId: `kg2cz6z5xsw639tvvgb1ten94s6qn5yn` }),
        });

        const { url } = await response.json();

        setFileUrl(url);
    };

    React.useEffect(() => {
        requestPermission();

        if (!fileUrl) {
            getFileUrl();
        }
    }, []);

    return (
        <ClerkProvider publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}>
            <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                {fileUrl ? <Wormhole source={{ uri: fileUrl }} /> : <Text>123</Text>}
            </ConvexProviderWithClerk>
        </ClerkProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
