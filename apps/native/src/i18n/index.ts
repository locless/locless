import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HttpApi from 'i18next-http-backend';

const loadResources = async (locale: string) => {
  return await fetch(`https://api.locless.com/translations/${locale}`, {
    headers: {
      'x-api-key': process.env.EXPO_PUBLIC_LOCLESS_PUBLIC_KEY,
    },
  })
    .then(res => res.json())
    .catch(error => {
      console.log(error);
    });
};

const backendOptions = {
  loadPath: '{{lng}}|{{ns}}',
  request: (options: any, url: any, payload: any, callback: any) => {
    try {
      const [lng] = url.split('|');
      loadResources(lng).then(response => {
        console.log(response);
        callback(null, {
          data: response,
          status: 200,
        });
      });
    } catch (e) {
      console.log(e, 'error from language');
      callback(null, {
        status: 500,
      });
    }
  },
};

const initI18n = async () => {
  let savedLanguage = await AsyncStorage.getItem('language');

  if (!savedLanguage) {
    savedLanguage = Localization.getLocales()[0].languageTag;
  }

  i18n
    .use(HttpApi)
    .use(initReactI18next)
    .init({
      backend: backendOptions,
      compatibilityJSON: 'v3',
      lng: savedLanguage,
      fallbackLng: 'en-US',
      debug: false,
      ns: ['translations'],
      defaultNS: 'translations',
      interpolation: {
        escapeValue: false,
      },
    });
};

initI18n();

export default i18n;
