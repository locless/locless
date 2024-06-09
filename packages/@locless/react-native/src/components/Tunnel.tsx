import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { createComponent } from '../utils';

export type TunnelProps = {
  readonly componentName: string;
  readonly globalRequires: Record<string, NodeRequire>;
  readonly renderLoading?: () => JSX.Element;
  readonly renderError?: (props: { readonly error: Error }) => JSX.Element;
  readonly onError?: (error: Error) => void;
};

const Tunnel = ({
  componentName,
  globalRequires,
  renderLoading = () => <></>,
  renderError = () => <></>,
  onError = console.error,
  ...extras
}: TunnelProps): JSX.Element => {
  const { data: fetchedData, error } = useQuery({
    queryKey: [`${componentName}`],
    queryFn: async ({ queryKey }) => {
      const result = await axios({
        url: `https://api.locless.com/file/${queryKey[0]}`,
        method: 'get',
      });
      const { data } = result;
      return data;
    },
  });

  const defaultImportsConfig = useMemo(() => {
    const mergedGlobal = { ...(globalRequires ?? {}) };

    const defaultGlobal = Object.freeze({
      require: (moduleId: string) => {
        if (typeof mergedGlobal[moduleId] === 'undefined') {
          throw new Error(`[Locless]: Please add require(${moduleId}) to global prop.`);
        }

        return mergedGlobal[moduleId] ?? null;
      },
    });

    return defaultGlobal;
  }, [globalRequires]);

  const [Component, setComponent] = useState<React.Component | undefined>(undefined);

  useEffect(() => {
    (async () => {
      try {
        if (fetchedData) {
          if (typeof fetchedData !== 'string') {
            throw new Error(`[Locless]: Expected string data, encountered ${typeof fetchedData}.`);
          }

          const CreatedComponent = await createComponent(defaultImportsConfig, fetchedData);
          return setComponent(() => CreatedComponent);
        }
      } catch (e: any) {
        setComponent(() => undefined);
        onError(e);
      }
    })();
  }, [fetchedData, defaultImportsConfig, onError]);

  useEffect(() => {
    if (error) {
      onError(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const FallbackComponent = useCallback((): JSX.Element => {
    return renderError({ error: new Error('[Locless]: Failed to render.') });
  }, [renderError]);

  if (typeof Component === 'function') {
    return (
      <ErrorBoundary FallbackComponent={FallbackComponent}>
        {/* @ts-ignore */}
        <Component {...extras} />
      </ErrorBoundary>
    );
  } else if (error) {
    return renderError({ error });
  }

  return renderLoading();
};

export default Tunnel;
