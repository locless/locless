export interface LoclessContextState {
  defaultImportsConfig: Readonly<{ require: (moduleId: string) => NodeRequire | null }>;
}
