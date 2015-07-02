interface ITry<F, T> {
  (err?: Error, result?: F): T;
}

interface IFailure<T> {
  (err: Error): T;
}

interface ISuccess<F, T> {
  (result: F): T;
}

interface IEmpty<T> {
  (): T;
}
