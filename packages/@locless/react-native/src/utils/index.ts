import axios from 'axios';
import type { PromiseCallback, TunnelOptions, TunnelSource } from '../@types';

const globalName = '__LOCLESS__';

export const createComponent =
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

export const requestOpenUri = ({
  onCacheUpdate,
  shouldCreateComponent,
  shouldComplete,
  apiKey,
}: {
  onCacheUpdate: (key: string, component: React.Component | null) => void;
  shouldCreateComponent: (src: string) => Promise<React.Component>;
  shouldComplete: (componentId: string, error?: Error) => void;
  apiKey: string;
}) => {
  return async (componentId: string) => {
    try {
      const result = await axios({
        url: `https://api.xan50rus.workers.dev/file/${componentId}`,
        method: 'get',
        headers: {
          'x-api-key': apiKey,
        },
      });
      const { data } = result;
      if (typeof data !== 'string') {
        throw new Error(`[Locless]: Expected string data, encountered ${typeof data}.`);
      }
      const Component = await shouldCreateComponent(data);
      onCacheUpdate(componentId, Component);
      return shouldComplete(componentId);
    } catch (e: any) {
      onCacheUpdate(componentId, null);
      if (typeof e === 'string') {
        return shouldComplete(componentId, new Error(e));
      } else if (typeof e.message === 'string') {
        return shouldComplete(componentId, new Error(`${e.message}`));
      }
      return shouldComplete(componentId, e);
    }
  };
};

export const openString =
  ({ shouldCreateComponent }: { shouldCreateComponent: (src: string) => Promise<React.Component> }) =>
  async (src: string) => {
    return shouldCreateComponent(src);
  };

export const openTunnel = async ({
  source,
  options,
  shouldOpenString,
  shouldOpenUri,
}: {
  source: TunnelSource;
  options: TunnelOptions;
  shouldOpenString: (src: string) => Promise<React.Component>;
  shouldOpenUri: (componentId: string, callback: PromiseCallback<React.Component>) => void;
}): Promise<React.Component> => {
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
      return new Promise<React.Component>((resolve, reject) => shouldOpenUri(componentId, { resolve, reject }));
    }
  }
  throw new Error(`[Locless]: Expected valid source, encountered ${typeof source}.`);
};
