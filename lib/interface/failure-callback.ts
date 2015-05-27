interface IFutureFailureCallback<R> {
  (err: R): void;
}

export = IFutureFailureCallback;
