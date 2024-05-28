import React, { useState, useEffect, useCallback, useContext } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { useForceUpdate } from '../hooks';
import LoclessContext from '../providers/LoclessContext';

export type TunnelProps = {
  readonly componentId: string;
  readonly renderLoading?: () => JSX.Element;
  readonly renderError?: (props: { readonly error: Error }) => JSX.Element;
  readonly dangerouslySetInnerJSX?: boolean;
  readonly onError?: (error: Error) => void;
};

const Tunnel = ({
  componentId,
  renderLoading = () => <></>,
  renderError = () => <></>,
  dangerouslySetInnerJSX = false,
  onError = console.error,
  ...extras
}: TunnelProps): JSX.Element => {
  const { forceUpdate } = useForceUpdate();

  const { preloadCache } = useContext(LoclessContext);

  const [Component, setComponent] = useState<React.Component | undefined>(undefined);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const Component = await preloadCache(componentId, dangerouslySetInnerJSX);
        return setComponent(() => Component);
      } catch (e: any) {
        setComponent(() => undefined);
        setError(e);
        onError(e);
        return forceUpdate();
      }
    })();
  }, [componentId, dangerouslySetInnerJSX, onError]);

  const FallbackComponent = useCallback((): JSX.Element => {
    return renderError({ error: new Error('[Wormhole]: Failed to render.') });
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
