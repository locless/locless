import { useState, useCallback } from 'react';

export default function useForceUpdate(): {
  readonly forceUpdate: () => void;
} {
  const [, setState] = useState(false);

  const forceUpdate = useCallback(() => {
    setState(e => !e);
  }, [setState]);

  return { forceUpdate };
}
