import Promise = require('mpromise');

interface IFutureFunction<T> {
  (): T;
}

interface IFutureCallback<T> {
  (err?: Error, result?: T): void;
}

interface IFutureSuccessCallback<T> {
  (result: T): void;
}

interface IFutureFailureCallback {
  (err: Error): void;
}

interface IFutureCompleteCallback<T> {
  (result: Error | T, isSuccess: boolean): void;
}

function rejectOnError<T>(promise: Promise<T>, callback: () => void) {
  try  {
    callback();
  } catch (ex) {
    promise.reject(ex);
  }
}

class Future<T> {
  private promise: Promise<T>

  constructor(promise: Promise<T>) {
    this.promise = promise;
  }

  static sequence(...futures: Future<any>[]): Future<any[]> {
    let makeSequence = function <T>(futures: Future<any>[], result: any[]): Future<any[]> {
      if (futures.length === 0) {
        return Future.successful(result);
      }

      let future: Future<T> = futures.shift();

      return future.flatMap(function (value: T): Future<any[]> {
        return makeSequence(futures, result.concat(value));
      });
    };

    return makeSequence(futures, []);
  }

  static successful<T>(result: T): Future<T> {
    let newPromise = new Promise<T>();
    newPromise.fulfill(result);

    return new Future<T>(newPromise);
  }

  static failed<T>(err: Error): Future<T> {
    let newPromise = new Promise<T>();
    newPromise.reject(err);

    return new Future<T>(newPromise);
  }

  static create<T>(fn: IFutureFunction<T>): Future<T> {
    let newPromise = new Promise<T>();
    setTimeout(function () {
      rejectOnError(newPromise, function () {
        let result = fn();
        newPromise.fulfill(result);
      });
    }, 0);
    return new Future<T>(newPromise);
  }

  static denodify<T>(fn: Function, thisArg: any, ...args: any[]): Future<T> {
    let newPromise = new Promise<T>();
    args.push((err: Error, result: T) => {
      if (err) {
        newPromise.reject(err);
        return;
      }

      newPromise.fulfill(result);
    });

    fn.apply(thisArg, args);

    return new Future<T>(newPromise);
  }

  onComplete(callback: IFutureCompleteCallback<T>) {
    this.promise.onResolve(function (err: Error, result: T) {
      if (err) {
        callback(err, false);
        return;
      }

      callback(result, true);
    });
    return this;
  }

  onSuccess(callback: IFutureSuccessCallback<T>) {
    this.promise.onFulfill(callback);
    return this;
  }

  onFailure(callback: IFutureFailureCallback) {
    this.promise.onReject(callback);
    return this;
  }

  map<U>(mapping: (org: T) => U): Future<U> {
    let newPromise = new Promise<U>();

    this.promise.onResolve(function (err: Error, result: T) {
      if (err) {
        newPromise.reject(err);
        return;
      }

      rejectOnError(newPromise, function () {
        newPromise.fulfill(mapping(result));
      });
    });

    return new Future<U>(newPromise);
  }

  flatMap<U>(futuredMapping: (org: T) => Future<U>): Future<U> {
    let newPromise = new Promise<U>();

    this.promise.onResolve(function (err: Error, result: T) {
      if (err) {
        newPromise.reject(err);
        return;
      }

      rejectOnError(newPromise, function () {
        futuredMapping(result)
        .onComplete(function (result: Error | U, isSuccess: boolean) {
          if (isSuccess) {
            newPromise.fulfill(<U>result);
          } else {
            newPromise.reject(<Error>result);
          }
        });
      });
    });

    return new Future<U>(newPromise);
  }

  filter(filterFunction: (value: T) => boolean): Future<T> {
    let newPromise = new Promise<T>();

    this.promise.onResolve(function (err: Error, result: T) {
      if (err) {
        newPromise.reject(err);
        return;
      }

      rejectOnError(newPromise, function () {
        if (filterFunction(result)) {
          newPromise.fulfill(result);
        } else {
          newPromise.reject(new Error("no.such.element"));
        }
      });
    });

    return new Future<T>(newPromise);
  }

  recover(recoverFunction: (err: Error) => T): Future<T> {
    let newPromise = new Promise<T>();

    this.promise.onResolve(function (err: Error, result: T) {
      if (err) {
        rejectOnError(newPromise, function () {
          newPromise.fulfill(recoverFunction(err));
        });
        return;
      }

      newPromise.fulfill(result);
    });

    return new Future<T>(newPromise);
  }

  transform<U>(transformFunction: (err: Error, result: T) => (U|Error)): Future<U> {
    let newPromise = new Promise<U>();

    this.promise.onResolve(function (err: Error, result: T) {
      rejectOnError(newPromise, function () {
        let newValue: (U|Error) = transformFunction(err, result);
        if (err) {
          newPromise.reject(<Error>newValue);
          return;
        }

        newPromise.fulfill(<U>newValue);
      });
    });

    return new Future<U>(newPromise);
  }

  andThen(callback: IFutureCallback<T>) {
    let newPromise = new Promise<T>();
    newPromise.onResolve(callback);

    this.promise.chain(newPromise);

    return new Future<T>(this.promise);
  }

  // TODO: firstCompletedOf(...futures: Future<any>[]): Future<any> Currently, no idea how to implement it.

  nodify(callback: (err: Error, result: T) => void) {
    this.promise.onResolve(callback);
  }

}

export = Future;
