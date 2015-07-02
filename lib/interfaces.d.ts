interface ITry<F, T> {
  (err?: any, result?: F): T;
}

interface IFailure<T> {
  (err: any): T;
}

interface ISuccess<F, T> {
  (result: F): T;
}

interface IEmpty<T> {
  (): T;
}
