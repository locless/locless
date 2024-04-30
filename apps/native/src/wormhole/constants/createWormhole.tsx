import * as React from 'react';
import axios, { AxiosPromise, AxiosRequestConfig, AxiosResponse } from 'axios';

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
    (uri: string, error?: Error): void => {
        const { [uri]: maybeComponent } = cache;
        const { [uri]: callbacks } = tasks;
        Object.assign(tasks, { [uri]: null });
        callbacks.forEach(({ resolve, reject }) => {
            if (!!maybeComponent) {
                return resolve(maybeComponent);
            }
            return reject(error || new Error(`[Locless]: Failed to allocate for uri "${uri}".`));
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
        buildRequestForUri,
        verify,
        shouldCreateComponent,
        shouldComplete,
    }: {
        readonly cache: WormholeComponentCache;
        readonly buildRequestForUri: (config: AxiosRequestConfig) => AxiosPromise<string>;
        readonly verify: (response: AxiosResponse<string>) => Promise<boolean>;
        readonly shouldCreateComponent: (src: string) => Promise<React.Component>;
        readonly shouldComplete: (uri: string, error?: Error) => void;
    }) =>
    async (uri: string) => {
        try {
            const result = await buildRequestForUri({
                url: uri,
                method: 'get',
            });
            const { data } = result;
            if (typeof data !== 'string') {
                throw new Error(`[Locless]: Expected string data, encountered ${typeof data}.`);
            }
            if ((await verify(result)) !== true) {
                throw new Error(`[Locless]: Failed to verify "${uri}".`);
            }
            const Component = await shouldCreateComponent(data);
            Object.assign(cache, { [uri]: Component });
            return shouldComplete(uri);
        } catch (e) {
            Object.assign(cache, { [uri]: null });
            if (typeof e === 'string') {
                return shouldComplete(uri, new Error(e));
            } else if (typeof e.message === 'string') {
                return shouldComplete(uri, new Error(`${e.message}`));
            }
            return shouldComplete(uri, e);
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
        readonly shouldRequestOpenUri: (uri: string) => void;
    }) =>
    (uri: string, callback: PromiseCallback<React.Component>): void => {
        const { [uri]: Component } = cache;
        const { resolve, reject } = callback;
        if (Component === null) {
            return reject(new Error(`[Locless]: Component at uri "${uri}" could not be instantiated.`));
        } else if (typeof Component === 'function') {
            return resolve(Component);
        }

        const { [uri]: queue } = tasks;
        if (Array.isArray(queue)) {
            queue.push(callback);
            return;
        }

        Object.assign(tasks, { [uri]: [callback] });

        return shouldRequestOpenUri(uri);
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
        readonly shouldOpenUri: (uri: string, callback: PromiseCallback<React.Component>) => void;
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
            const { uri } = source;
            if (typeof uri === 'string') {
                return new Promise<React.Component>((resolve, reject) => shouldOpenUri(uri, { resolve, reject }));
            }
        }
        throw new Error(`[Locless]: Expected valid source, encountered ${typeof source}.`);
    };

export default function createWormhole({
    buildRequestForUri = (config: AxiosRequestConfig) => axios(config),
    global,
    verify,
}: WormholeContextConfig) {
    if (typeof verify !== 'function') {
        throw new Error('[Locless]: To create a Locless, you **must** pass a verify() function.');
    }

    const cache: WormholeComponentCache = {};
    const tasks: WormholeTasks = {};

    const mergedGlobal = { ...defaultGlobalImports, ...(global ?? {}) };

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
        buildRequestForUri,
        verify,
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

    const preload = async (uri: string): Promise<void> => {
        await shouldOpenWormhole({ uri }, { dangerouslySetInnerJSX: false });
    };

    return Object.freeze({
        Wormhole,
        preload,
    });
}
