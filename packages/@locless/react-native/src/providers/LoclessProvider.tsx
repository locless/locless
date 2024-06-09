import type { PropsWithChildren } from 'react';
import React, { useEffect, useMemo } from 'react';
import axios from 'axios';
import LoclessContext from './LoclessContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { LoclessContextState } from './types';

const defaultGlobalImports = {
  '@babel/runtime/helpers/interopRequireDefault': require('@babel/runtime/helpers/interopRequireDefault'),
  '@babel/runtime/helpers/slicedToArray': require('@babel/runtime/helpers/slicedToArray'),
  react: require('react'),
  'react-native': require('react-native'),
  'react/jsx-runtime': require('react/jsx-runtime'),
};

type LoclessConfig = {
  preloadArray?: string[];
  customImports?: Record<string, NodeRequire>;
  apiKey: string;
};

interface Props extends PropsWithChildren {
  config: LoclessConfig;
}

const queryClient = new QueryClient();

const LoclessProvider = ({ children, config: { preloadArray, customImports, apiKey } }: Props) => {
  axios.defaults.headers['x-api-key'] = apiKey;

  const defaultImportsConfig = useMemo(() => {
    const mergedGlobal: Record<string, NodeRequire> = { ...defaultGlobalImports, ...(customImports ?? {}) };

    const defaultGlobal = Object.freeze({
      require: (moduleId: string) => {
        if (typeof mergedGlobal[moduleId] === 'undefined') {
          throw new Error(`[Locless]: Please add require(${moduleId}) to global prop.`);
        }

        return mergedGlobal[moduleId] ?? null;
      },
    });

    return defaultGlobal;
  }, [customImports]);

  useEffect(() => {
    (async () => {
      if (preloadArray && preloadArray.length > 0) {
        for (const item of preloadArray) {
          await queryClient.prefetchQuery({
            queryKey: [`${item}`],
            queryFn: async ({ queryKey }) => {
              const result = await axios({
                url: `https://api.locless.com/file/${queryKey[0]}`,
                method: 'get',
              });
              const { data } = result;
              return data;
            },
          });
        }
      }
    })();
  }, [preloadArray]);

  const contextValue = useMemo<LoclessContextState>(
    () => ({
      defaultImportsConfig,
    }),
    [defaultImportsConfig]
  );

  return (
    <LoclessContext.Provider value={contextValue}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </LoclessContext.Provider>
  );
};

export default LoclessProvider;
