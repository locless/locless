import { ZodError } from 'zod';

export type ErrorContext = Record<string, unknown>;

export abstract class BaseError<TContext extends ErrorContext = ErrorContext> extends Error {
  public abstract readonly retry: boolean;
  public readonly cause: BaseError | undefined;
  public readonly context: TContext | undefined;
  public abstract readonly name: string;

  constructor(opts: { message: string; cause?: BaseError; context?: TContext }) {
    super(opts.message);
    this.cause = opts.cause;
    this.context = opts.context;
  }

  public toString(): string {
    return `${this.name}: ${this.message} - ${JSON.stringify(this.context)} - caused by ${this.cause?.toString()}`;
  }
}

type OkResult<V> = {
  val: V;
  err?: never;
};

type ErrResult<E extends BaseError> = {
  val?: never;
  err: E;
};

export type Result<V, E extends BaseError = BaseError> = OkResult<V> | ErrResult<E>;

export function Ok(): OkResult<never>;
export function Ok<V>(val: V): OkResult<V>;
export function Ok<V>(val?: V): OkResult<V> {
  return { val } as OkResult<V>;
}
export function Err<E extends BaseError>(err: E): ErrResult<E> {
  return { err };
}

export class SchemaError extends BaseError<{ raw: unknown }> {
  public readonly retry = false;
  public readonly name = SchemaError.name;

  constructor(opts: { message: string; context?: { raw: unknown }; cause?: BaseError }) {
    super({
      ...opts,
    });
  }
  static fromZod<T>(e: ZodError<T>, raw: unknown, context?: Record<string, unknown>): SchemaError {
    return new SchemaError({
      message: e.message,
      context: {
        raw: JSON.stringify(raw),
        ...context,
      },
    });
  }
}
