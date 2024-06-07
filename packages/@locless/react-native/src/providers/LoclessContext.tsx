import { createContext } from 'react';
import type { LoclessContextState } from './types';

const asyncFn = async () => undefined;

const LoclessContext = createContext<LoclessContextState>({
  data: {},
  preloadCache: asyncFn,
});

export default LoclessContext;
