interface IFutureCallback<F, R> {
  (err?: R, result?: F): void;
}

export = IFutureCallback;
