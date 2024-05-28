export type PromiseCallback<T> = {
  readonly resolve: (result: T) => void;
  readonly reject: (error: Error) => void;
};

export type TunnelSource =
  | {
      readonly componentId: string;
    }
  | string;

export type TunnelComponentCache = {
  readonly [componentId: string]: React.Component | null;
};

export type TunnelTasks = {
  readonly [componentId: string]: PromiseCallback<React.Component>[];
};

export type TunnelOptions = {
  readonly dangerouslySetInnerJSX: boolean;
};

export type TunnelContextConfig = {
  readonly global?: any;
};
