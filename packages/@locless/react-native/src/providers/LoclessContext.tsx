import { createContext } from 'react';
import type { LoclessContextState } from './types';

const fn = () => undefined;
const asyncFn = async () => undefined;

const LoclessContext = createContext<LoclessContextState>({
  data: {},
  getCache: fn,
  preloadCache: asyncFn,
});

export default LoclessContext;
