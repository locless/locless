import * as React from 'react';
import { LoclessProvider } from '@locless/react-native';
import LocDemoComponent from 'locless/generated/LocDemoComponent';
// import i18n from 'src/i18n';
// import LanguageSwitch from 'src/components/LanguageSwitch';
// import { I18nextProvider } from 'react-i18next';

export default function App() {
  return (
    <LoclessProvider config={{ apiKey: process.env.EXPO_PUBLIC_LOCLESS_PUBLIC_KEY }}>
      {/*<I18nextProvider i18n={i18n}>
        <LocDemoComponent />
        <LanguageSwitch />
      </I18nextProvider>*/}

      <LocDemoComponent />
    </LoclessProvider>
  );
}
