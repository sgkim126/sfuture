interface IFutureSuccessCallback<T> {
  (result: T): void;
}

export = IFutureSuccessCallback;
