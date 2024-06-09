import { createContext } from 'react';
import type { LoclessContextState } from './types';

const LoclessContext = createContext<LoclessContextState>({
  defaultImportsConfig: {} as any,
});

export default LoclessContext;
