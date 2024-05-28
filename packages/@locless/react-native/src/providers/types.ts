export interface LoclessContextState {
  data: Record<string, React.Component>;
  getCache: (key: string) => void;
  preloadCache: (key: string, dangerouslySetInnerJSX?: boolean) => Promise<React.Component | undefined>;
}
