import * as React from 'react';
import { LoclessProvider } from '@locless/react-native';
import LocComponentDemoComponent from './locless/generated/LocComponentDemoComponent';

//9a896e45-6d24-4ecd-83f9-ef15cb937f64
//{...({ name: '345' } as any)}

export default function App() {
  return (
    <LoclessProvider>
      <LocComponentDemoComponent />
    </LoclessProvider>
  );
}
