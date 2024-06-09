import React, { useState, useEffect, useCallback, useContext } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { createComponent } from '../utils';
import LoclessContext from '../providers/LoclessContext';

export type TunnelProps = {
  readonly componentName: string;
  readonly renderLoading?: () => JSX.Element;
  readonly renderError?: (props: { readonly error: Error }) => JSX.Element;
  readonly onError?: (error: Error) => void;
};

const Tunnel = ({
  componentName,
  renderLoading = () => <></>,
  renderError = () => <></>,
  onError = console.error,
  ...extras
}: TunnelProps): JSX.Element => {
  const { defaultImportsConfig } = useContext(LoclessContext);
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
