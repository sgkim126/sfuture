// Type definitions for mpromise 0.5.4
// Project: https://github.com/aheckmann/mpromise
// Copied from mongoose of DefinitelyTyped

declare module "mpromise" {
  class Promise<T> {
    constructor(fn?: (err: Error, result: T) => void);

    then<U>(onFulFill: (result: T) => void, onReject?: (err: Error) => void): Promise<U>;
    end(): void;

    fulfill(result: T): Promise<T>;
    reject(err: Error): Promise<T>;
    resolve(err: Error, result: T): Promise<T>;

    chain(promise: Promise<T>): Promise<T>;

    onFulfill(listener: (result: T) => void): Promise<T>;
    onReject(listener: (err: Error) => void): Promise<T>;
    onResolve(listener: (err: Error, result: T) => void): Promise<T>;
    on(event: string, listener: Function): Promise<T>;

    // Deprecated methods.
    addBack(listener: (err: Error, result: T) => void): Promise<T>;
    addCallback(listener: (result: T) => void): Promise<T>;
    addErrback(listener: (err: Error) => void): Promise<T>;
    complete(result: T): Promise<T>;
    error(err: Error): Promise<T>;
  }

  export = Promise;
}
