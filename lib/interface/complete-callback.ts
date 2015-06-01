interface IFutureCompleteCallback<F, R> {
  (isSuccess: boolean, result?: R | F): void;
}

export = IFutureCompleteCallback;
