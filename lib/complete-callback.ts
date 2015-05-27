interface IFutureCompleteCallback<T> {
  (result: Error | T, isSuccess: boolean): void;
}

export = IFutureCompleteCallback;
