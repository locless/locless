import type { PropsWithChildren } from 'react';
import React, { useState, useMemo, useEffect } from 'react';
import LoclessContext from './LoclessContext';
import type { LoclessContextState } from './types';
import { completionHandler, createComponent, openString, openUri, requestOpenUri, openTunnel } from '../utils';
import type { PromiseCallback } from '../@types';

const defaultGlobalImports = {
  '@babel/runtime/helpers/interopRequireDefault': require('@babel/runtime/helpers/interopRequireDefault'),
  '@babel/runtime/helpers/slicedToArray': require('@babel/runtime/helpers/slicedToArray'),
  react: require('react'),
  'react-native': require('react-native'),
  'react/jsx-runtime': require('react/jsx-runtime'),
};

interface Props extends PropsWithChildren {
  preloadArray?: string[];
  customImports?: Record<string, string>;
}

const LoclessProvider = ({ children, preloadArray, customImports }: Props) => {
  const [cacheData, setCacheData] = useState<Record<string, React.Component>>({});
  const [tasks, setTasks] = useState<Record<string, PromiseCallback<React.Component>[]>>({});

  const getCache = (key: string) => {
    return cacheData[key];
  };

  const onCacheUpdate = (key: string, component: React.Component | null) => {
    setCacheData(current => {
      const dataCopy = { ...current };

      if (!component) {
        delete dataCopy[key];
      } else {
        dataCopy[key] = component;
      }

      return dataCopy;
    });
  };

  const onTasksUpdate = (key: string, callback: PromiseCallback<React.Component> | null) => {
    setTasks(current => {
      const dataCopy = { ...current };

      if (!callback) {
        delete dataCopy[key];
      } else {
        const oldCallback = dataCopy[key];
        dataCopy[key] = [...(oldCallback ?? []), callback];
      }

      return dataCopy;
    });
  };

  const preloadCache = async (key: string, dangerouslySetInnerJSX = false) => {
    const component = cacheData[key];

    if (component) {
      return component;
    }

    try {
      const mergedGlobal: Record<string, NodeRequire> = { ...defaultGlobalImports, ...(customImports ?? {}) };

      const defaultGlobal = Object.freeze({
        require: (moduleId: string) => {
          if (typeof mergedGlobal[moduleId] === 'undefined') {
            throw new Error(`[Locless]: Please add require(${moduleId}) to global prop.`);
          }

          return mergedGlobal[moduleId] ?? null;
        },
      });

      const shouldComplete = completionHandler(cacheData, tasks, onTasksUpdate);

      const shouldCreateComponent = createComponent(defaultGlobal);

      const shouldRequestOpenUri = requestOpenUri({
        onCacheUpdate,
        shouldCreateComponent,
        shouldComplete,
      });

      const shouldOpenUri = openUri({
        cache: cacheData,
        onTasksUpdate,
        shouldRequestOpenUri,
      });

      const shouldOpenString = openString({
        shouldCreateComponent,
      });

      const shouldOpenWormhole = await openTunnel({
        source: { componentId: key },
        options: { dangerouslySetInnerJSX },
        shouldOpenUri,
        shouldOpenString,
      });

      return shouldOpenWormhole;
    } catch (err) {
      console.log(err);
      return undefined;
    }
  };

  const contextValue = useMemo<LoclessContextState>(
    () => ({
      data: cacheData,
      getCache,
      preloadCache,
    }),
    []
  );

  useEffect(() => {
    (async () => {
      if (preloadArray && preloadArray.length > 0) {
        for (const item of preloadArray) {
          await preloadCache(item);
        }
      }
    })();
  }, [preloadArray]);

  return <LoclessContext.Provider value={contextValue}>{children}</LoclessContext.Provider>;
};

export default LoclessProvider;
