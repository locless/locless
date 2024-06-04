import * as React from 'react';
import { LoclessProvider } from '@locless/react-native';
import LocDemoComponent from 'locless/generated/LocDemoComponent';

//9a896e45-6d24-4ecd-83f9-ef15cb937f64
//{...({ name: '345' } as any)}

export default function App() {
  return (
    <LoclessProvider config={{ apiKey: process.env.EXPO_PUBLIC_LOCLESS_PUBLIC_KEY }}>
      <LocDemoComponent />
    </LoclessProvider>
  );
}
