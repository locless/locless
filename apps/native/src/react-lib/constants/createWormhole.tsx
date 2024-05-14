import * as React from 'react';
import axios, { AxiosPromise, AxiosRequestConfig } from 'axios';

import {
    PromiseCallback,
    WormholeContextConfig,
    WormholeSource,
    WormholeOptions,
    WormholeComponentCache,
    WormholeTasks,
} from '../@types';

import { Wormhole as BaseWormhole } from '../components';
import { WormholeProps } from '../components/Wormhole';

const globalName = '__WORMHOLE__';

const defaultGlobalImports = {
    '@babel/runtime/helpers/interopRequireDefault': require('@babel/runtime/helpers/interopRequireDefault'),
    '@babel/runtime/helpers/slicedToArray': require('@babel/runtime/helpers/slicedToArray'),
    react: require('react'),
    'react-native': require('react-native'),
    'react/jsx-runtime': require('react/jsx-runtime'),
};

const buildCompletionHandler =
    (cache: WormholeComponentCache, tasks: WormholeTasks) =>
    (componentId: string, error?: Error): void => {
        const { [componentId]: maybeComponent } = cache;
        const { [componentId]: callbacks } = tasks;
        Object.assign(tasks, { [componentId]: null });
        callbacks.forEach(({ resolve, reject }) => {
            if (!!maybeComponent) {
                return resolve(maybeComponent);
            }
            return reject(error || new Error(`[Locless]: Failed to allocate for componentId "${componentId}".`));
        });
    };

const buildCreateComponent =
    (global: any) =>
    async (src: string): Promise<React.Component> => {
        const Component = await new Function(
            globalName,
            `${Object.keys(global)
                .map(key => `var ${key} = ${globalName}.${key};`)
                .join('\n')}; const exports = {}; ${src}; return exports.default;`
        )(global);
        if (typeof Component !== 'function') {
            throw new Error(
                `[Locless]: Expected function, encountered ${typeof Component}. Did you forget to mark your Locless as a default export?`
            );
        }
        return Component;
    };

const buildRequestOpenUri =
    ({
        cache,
        shouldCreateComponent,
        shouldComplete,
    }: {
        readonly cache: WormholeComponentCache;
        readonly shouldCreateComponent: (src: string) => Promise<React.Component>;
        readonly shouldComplete: (componentId: string, error?: Error) => void;
    }) =>
    async (componentId: string) => {
        try {
            const result = await axios({
                url: `${process.env.EXPO_PUBLIC_DEV_WEBSITE}/file/${componentId}`,
                method: 'get',
                headers: {
                    'x-api-key': process.env.EXPO_PUBLIC_LOCLESS_PUBLIC_KEY,
                },
            });
            const { data } = result;
            if (typeof data !== 'string') {
                throw new Error(`[Locless]: Expected string data, encountered ${typeof data}.`);
            }
            const Component = await shouldCreateComponent(data);
            Object.assign(cache, { [componentId]: Component });
            return shouldComplete(componentId);
        } catch (e) {
            Object.assign(cache, { [componentId]: null });
            if (typeof e === 'string') {
                return shouldComplete(componentId, new Error(e));
            } else if (typeof e.message === 'string') {
                return shouldComplete(componentId, new Error(`${e.message}`));
            }
            return shouldComplete(componentId, e);
        }
    };

const buildOpenUri =
    ({
        cache,
        tasks,
        shouldRequestOpenUri,
    }: {
        readonly cache: WormholeComponentCache;
        readonly tasks: WormholeTasks;
        readonly shouldRequestOpenUri: (componentId: string) => void;
    }) =>
    (componentId: string, callback: PromiseCallback<React.Component>): void => {
        const { [componentId]: Component } = cache;
        const { resolve, reject } = callback;
        if (Component === null) {
            return reject(new Error(`[Locless]: Component with ID "${componentId}" could not be instantiated.`));
        } else if (typeof Component === 'function') {
            return resolve(Component);
        }

        const { [componentId]: queue } = tasks;
        if (Array.isArray(queue)) {
            queue.push(callback);
            return;
        }

        Object.assign(tasks, { [componentId]: [callback] });

        return shouldRequestOpenUri(componentId);
    };

const buildOpenString =
    ({ shouldCreateComponent }: { readonly shouldCreateComponent: (src: string) => Promise<React.Component> }) =>
    async (src: string) => {
        return shouldCreateComponent(src);
    };

const buildOpenWormhole =
    ({
        shouldOpenString,
        shouldOpenUri,
    }: {
        readonly shouldOpenString: (src: string) => Promise<React.Component>;
        readonly shouldOpenUri: (componentId: string, callback: PromiseCallback<React.Component>) => void;
    }) =>
    async (source: WormholeSource, options: WormholeOptions): Promise<React.Component> => {
        const { dangerouslySetInnerJSX } = options;
        if (typeof source === 'string') {
            if (dangerouslySetInnerJSX === true) {
                return shouldOpenString(source as string);
            }
            throw new Error(
                `[Locless]: Attempted to instantiate a Locless using a string, but dangerouslySetInnerJSX was not true.`
            );
        } else if (source && typeof source === 'object') {
            const { componentId } = source;
            if (typeof componentId === 'string') {
                return new Promise<React.Component>((resolve, reject) =>
                    shouldOpenUri(componentId, { resolve, reject })
                );
            }
        }
        throw new Error(`[Locless]: Expected valid source, encountered ${typeof source}.`);
    };

export default function createWormhole(options?: WormholeContextConfig) {
    const cache: WormholeComponentCache = {};
    const tasks: WormholeTasks = {};

    const mergedGlobal = { ...defaultGlobalImports, ...(options?.global ?? {}) };

    const defaultGlobal = Object.freeze({
        require: (moduleId: string) => {
            if (typeof mergedGlobal[moduleId] === 'undefined') {
                throw new Error(`[Locless]: Please add require(${moduleId}) to global prop.`);
            }

            return mergedGlobal[moduleId] ?? null;
        },
    });

    const shouldComplete = buildCompletionHandler(cache, tasks);
    const shouldCreateComponent = buildCreateComponent(defaultGlobal);
    const shouldRequestOpenUri = buildRequestOpenUri({
        cache,
        shouldCreateComponent,
        shouldComplete,
    });
    const shouldOpenUri = buildOpenUri({
        cache,
        tasks,
        shouldRequestOpenUri,
    });
    const shouldOpenString = buildOpenString({
        shouldCreateComponent,
    });

    const shouldOpenWormhole = buildOpenWormhole({
        shouldOpenUri,
        shouldOpenString,
    });

    const Wormhole = (props: WormholeProps) => <BaseWormhole {...props} shouldOpenWormhole={shouldOpenWormhole} />;

    const preload = async (componentId: string): Promise<void> => {
        await shouldOpenWormhole({ componentId }, { dangerouslySetInnerJSX: false });
    };

    return Object.freeze({
        Wormhole,
        preload,
    });
}
