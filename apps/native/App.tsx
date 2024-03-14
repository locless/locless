import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, View } from "react-native";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient, useQuery } from "convex/react";
import "react-native-get-random-values";
import {
  BarcodeScanningResult,
  CameraView,
  PermissionStatus,
  useCameraPermissions,
} from "expo-camera/next";
import { useEffect, useState } from "react";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL, {
  unsavedChangesWarning: false,
});

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [didScan, setDidScan] = useState(false);

  const handleBarcodeScanned = (scanningResult: BarcodeScanningResult) => {
    console.log(scanningResult.data);
  };

  useEffect(() => {
    requestPermission();
  }, []);

  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <View style={styles.container}>
          <CameraView
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
            facing="back"
            style={{flex: 1,width:"100%"}}
            onBarcodeScanned={handleBarcodeScanned}
          />
        </View>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
