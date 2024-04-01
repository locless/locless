import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { StyleSheet, View } from 'react-native';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ConvexReactClient } from 'convex/react';
import 'react-native-get-random-values';
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera/next';
import { useEffect, useState } from 'react';
import { Id } from '@repo/backend/convex/_generated/dataModel';
import Preview from './src/Preview';

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL, {
    unsavedChangesWarning: false,
});

export default function App() {
    const [_permission, requestPermission] = useCameraPermissions();
    const [didScan, setDidScan] = useState(false);
    const [componentId, setComponentId] = useState<Id<'components'> | null>(null);
    const [projectId, setProjectId] = useState<Id<'projects'> | null>(null);
    const [environmentId, setEnvironmentId] = useState<Id<'environments'> | null>(null);

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

    useEffect(() => {
        requestPermission();
    }, []);

    return (
        <ClerkProvider publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}>
            <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                {projectId && componentId ? (
                    <Preview componentId={componentId} projectId={projectId} environmentId={environmentId} />
                ) : (
                    <View style={styles.container}>
                        <CameraView
                            barcodeScannerSettings={{
                                barcodeTypes: ['qr'],
                            }}
                            facing='back'
                            style={{ flex: 1, width: '100%' }}
                            onBarcodeScanned={handleBarcodeScanned}
                        />
                    </View>
                )}
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
