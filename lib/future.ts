import Promise = require('mpromise');
import IFutureFunction = require('./interface/function');
import IFutureCallback = require('./interface/callback');
import IFutureSuccessCallback = require('./interface/success-callback');
import IFutureFailureCallback = require('./interface/failure-callback');
import IFutureCompleteCallback = require('./interface/complete-callback');

function rejectOnError<T>(promise: Promise<T, Error>, callback: () => void) {
  try  {
    callback();
  } catch (ex) {
    promise.reject(ex);
  }
}

class Future<T> {
  private promise: Promise<T, Error>;

  constructor(promise: Promise<T, Error>) {
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
    let newPromise = new Promise<T, Error>();
    newPromise.fulfill(result);

    return new Future<T>(newPromise);
  }

  static failed<T>(err: Error): Future<T> {
    let newPromise = new Promise<T, Error>();
    newPromise.reject(err);

    return new Future<T>(newPromise);
  }

  static create<T>(fn: IFutureFunction<T, Error>): Future<T> {
    let newPromise = new Promise<T, Error>();
    setTimeout(
      function () {
        rejectOnError(newPromise, function () {
          let result = fn();
          newPromise.fulfill(result);
        });
      },
      0);
    return new Future<T>(newPromise);
  }

  static denodify<T>(fn: Function, thisArg: any, ...args: any[]): Future<T> {
    let newPromise = new Promise<T, Error>();
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

  onComplete(callback: IFutureCompleteCallback<T, Error>) {
    this.promise.onResolve(function (err: Error, result: T) {
      if (err) {
        callback(false, err);
        return;
      }

      callback(true, result);
    });
    return this;
  }

  onSuccess(callback: IFutureSuccessCallback<T, Error>) {
    this.promise.onFulfill(callback);
    return this;
  }

  onFailure(callback: IFutureFailureCallback<Error>) {
    this.promise.onReject(callback);
    return this;
  }

  map<U>(mapping: (org: T) => U): Future<U> {
    let newPromise = new Promise<U, Error>();

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
    let newPromise = new Promise<U, Error>();

    this.promise.onResolve(function (err: Error, result: T) {
      if (err) {
        newPromise.reject(err);
        return;
      }

      rejectOnError(newPromise, function () {
        futuredMapping(result)
        .onComplete(function (isSuccess: boolean, result: Error | U) {
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
    let newPromise = new Promise<T, Error>();

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
    let newPromise = new Promise<T, Error>();

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
    let newPromise = new Promise<U, Error>();

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

  andThen(callback: IFutureCallback<T, Error>) {
    let newPromise = new Promise<T, Error>();
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
