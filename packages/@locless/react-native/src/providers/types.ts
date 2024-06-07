export interface LoclessContextState {
  data: Record<string, React.Component>;
  preloadCache: (key: string, dangerouslySetInnerJSX?: boolean) => Promise<React.Component | undefined>;
}
