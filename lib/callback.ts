interface IFutureCallback<T> {
  (err?: Error, result?: T): void;
}

export = IFutureCallback;
