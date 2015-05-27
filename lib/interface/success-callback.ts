interface IFutureSuccessCallback<F, R> {
  (result: F): void;
}

export = IFutureSuccessCallback;
