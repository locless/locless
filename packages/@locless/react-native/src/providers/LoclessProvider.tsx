import type { PropsWithChildren } from 'react';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import LoclessContext from './LoclessContext';
import type { LoclessContextState } from './types';
import { createComponent, openString, requestOpenUri, openTunnel } from '../utils';
import type { PromiseCallback } from '../@types';

const defaultGlobalImports = {
  '@babel/runtime/helpers/interopRequireDefault': require('@babel/runtime/helpers/interopRequireDefault'),
  '@babel/runtime/helpers/slicedToArray': require('@babel/runtime/helpers/slicedToArray'),
  react: require('react'),
  'react-native': require('react-native'),
  'react/jsx-runtime': require('react/jsx-runtime'),
};

type LoclessConfig = {
  preloadArray?: string[];
  customImports?: Record<string, string>;
  apiKey: string;
};

interface Props extends PropsWithChildren {
  config: LoclessConfig;
}

const LoclessProvider = ({ children, config: { preloadArray, customImports, apiKey } }: Props) => {
  const [__, setCacheData] = useState<Record<string, React.Component>>({});
  const [_, setTasks] = useState<Record<string, PromiseCallback<React.Component>[]>>({});

  const cacheRef = useRef<Record<string, React.Component>>({});
  const tasksRef = useRef<Record<string, PromiseCallback<React.Component>[]>>({});

  const onCacheUpdate = (key: string, component: React.Component | null) => {
    setCacheData(current => {
      const dataCopy = { ...current };

      if (!component) {
        delete dataCopy[key];
      } else {
        dataCopy[key] = component;
      }

      cacheRef.current = dataCopy;

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

      tasksRef.current = dataCopy;

      return dataCopy;
    });
  };

  const completionHandler = (componentId: string, error?: Error): void => {
    const maybeComponent = cacheRef.current[componentId];
    const callbacks = tasksRef.current[componentId];

    onTasksUpdate(componentId, null);

    if (callbacks) {
      callbacks.forEach(({ resolve, reject }) => {
        if (!!maybeComponent) {
          return resolve(maybeComponent);
        }
        return reject(error || new Error(`[Locless]: Failed to allocate for componentId "${componentId}".`));
      });
    }
  };

  const openUri =
    (shouldRequestOpenUri: (componentId: string) => void) =>
    (componentId: string, callback: PromiseCallback<React.Component>): void => {
      const Component = cacheRef.current[componentId];
      const { resolve, reject } = callback;

      if (Component === null) {
        return reject(new Error(`[Locless]: Component with ID "${componentId}" could not be instantiated.`));
      } else if (typeof Component === 'function') {
        return resolve(Component);
      }

      onTasksUpdate(componentId, callback);

      return shouldRequestOpenUri(componentId);
    };

  const preloadCache = async (key: string, dangerouslySetInnerJSX = false) => {
    const component = cacheRef.current[key];

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

      const shouldCreateComponent = createComponent(defaultGlobal);

      const shouldRequestOpenUri = requestOpenUri({
        onCacheUpdate,
        shouldCreateComponent,
        shouldComplete: completionHandler,
        apiKey,
      });

      const shouldOpenUri = openUri(shouldRequestOpenUri);

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
      data: cacheRef.current,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preloadArray]);

  return <LoclessContext.Provider value={contextValue}>{children}</LoclessContext.Provider>;
};

export default LoclessProvider;
