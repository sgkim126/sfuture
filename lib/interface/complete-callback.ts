interface IFutureCompleteCallback<F, R> {
  (result: R | F, isSuccess: boolean): void;
}

export = IFutureCompleteCallback;
