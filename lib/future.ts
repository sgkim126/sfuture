import Promise = require('mpromise');
import util = require('util');
import IFutureFunction = require('./interface/function');
import IFutureCallback = require('./interface/callback');
import IFutureSuccessCallback = require('./interface/success-callback');
import IFutureFailureCallback = require('./interface/failure-callback');

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

  static failed<T>(err: Error): Future<T> {
    let newPromise = new Promise<T, Error>();
    newPromise.reject(err);

    return new Future<T>(newPromise);
  }

  static successful<T>(result: T): Future<T> {
    let newPromise = new Promise<T, Error>();
    newPromise.fulfill(result);

    return new Future<T>(newPromise);
  }

  static fromTry<T>(err: Error, result: T): Future<T> {
    let newPromise = new Promise<T, Error>();
    newPromise.resolve(err, result);

    return new Future<T>(newPromise);
  }


  static apply<T>(fn: IFutureFunction<T, Error>): Future<T> {
    let newPromise = new Promise<T, Error>();
    setTimeout(
      () => {
        rejectOnError(newPromise, () => {
          let result = fn();
          newPromise.fulfill(result);
        });
      },
      0);
    return new Future<T>(newPromise);
  }


  static sequence<T>(futures: Future<T>[]): Future<T[]> {
    let makeSequence = <T>(futures: Future<T>[], result: T[]): Future<T[]> => {
      if (futures.length === 0) {
        return Future.successful(result);
      }

      futures = futures.slice(0);
      result = result.slice(0);
      let future: Future<T> = futures.shift();

      return future.flatMap((value: T): Future<T[]> => {
        result.push(value);
        return makeSequence(futures, result);
      });
    };

    return makeSequence(futures, []);
  }

  static firstCompletedOf<T>(futures: Future<T>[]): Future<T> {
    let newPromise = new Promise<T, Error>();

    futures.map((future: Future<T>) => {
      future.onComplete((err: Error, result: T) => {
        newPromise.resolve(err, result);
      });
    });

    return new Future<T>(newPromise);
  }

  static find<T>(futures: Future<T>[], predicate: (value: T) => boolean): Future<T> {
    let count = futures.length;

    if (count === 0) {
      return Future.successful(null);
    }

    let newPromise = new Promise<T, Error>();

    let search = (err: Error, result: T): void => {
      count -= 1;
      if (!err) {
        if (predicate(result)) {
          newPromise.fulfill(result);
          return;
        }
      }

      if (count === 0) {
        newPromise.fulfill(null);
        return;
      }
    };

    futures.map((future: Future<T>) => {
      future.onComplete(search);
    });

    return new Future(newPromise);
  }

  static fold<T, R>(futures: Future<T>[], base: R, op: (base: R, result: T) => R): Future<R> {
    return Future.sequence(futures)
    .map((results: T[]) => {
      return results.reduce(op, base);
    });
  }

  static reduce<T>(futures: Future<T>[], op: (base: T, result: T) => T): Future<T> {
    if (futures.length === 0) {
      return Future.failed(new Error('reduce attempted on empty collection'));
    }

    return Future.sequence(futures)
    .map((results: T[]) => {
      let remains = results.slice(0);
      let first = remains.shift();

      return remains.reduce(op, first);
    });
  }

  static traverse<T, R>(args: T[], fn: (arg: T) => Future<R>): Future<R[]> {
    return Future.sequence(args.map(fn));
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

  onSuccess(callback: IFutureSuccessCallback<T, Error>) {
    this.promise.onFulfill(callback);
    return this;
  }

  onFailure(callback: IFutureFailureCallback<Error>) {
    this.promise.onReject(callback);
    return this;
  }

  onComplete(callback: IFutureCallback<T, Error>) {
    this.promise.onResolve(callback);
    return this;
  }


  foreach<U>(f: (result: T) => U): void {
    this.onSuccess(f);
  }

  transform<U>(transformFunction: (err: Error, result: T) => (U|Error)): Future<U> {
    let newPromise = new Promise<U, Error>();

    this.promise.onResolve((err: Error, result: T) => {
      rejectOnError(newPromise, () => {
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

  map<U>(mapping: (org: T) => U): Future<U> {
    let newPromise = new Promise<U, Error>();

    this.promise.onResolve((err: Error, result: T) => {
      if (err) {
        newPromise.reject(err);
        return;
      }

      rejectOnError(newPromise, () => {
        newPromise.fulfill(mapping(result));
      });
    });

    return new Future<U>(newPromise);
  }

  flatMap<U>(futuredMapping: (org: T) => Future<U>): Future<U> {
    let newPromise = new Promise<U, Error>();

    this.promise.onResolve((err: Error, result: T) => {
      if (err) {
        newPromise.reject(err);
        return;
      }

      rejectOnError(newPromise, () => {
        futuredMapping(result)
        .onComplete((err: Error, result: U) => {
          newPromise.resolve(err, result);
        });
      });
    });

    return new Future<U>(newPromise);
  }

  filter(filterFunction: (value: T) => boolean): Future<T> {
    let newPromise = new Promise<T, Error>();

    this.promise.onResolve((err: Error, result: T) => {
      if (err) {
        newPromise.reject(err);
        return;
      }

      rejectOnError(newPromise, () => {
        if (filterFunction(result)) {
          newPromise.fulfill(result);
        } else {
          newPromise.reject(new Error("no.such.element"));
        }
      });
    });

    return new Future<T>(newPromise);
  }

  collect<S>(pf: (value: T) => S): Future<S> {
    return this.map((value: T): S => {
      let result: S = pf(value);
      if (result === undefined) {
        throw new Error(util.format('Future.collect partial function is not defined at: %j', value));
      }

      return result;
    });
  }

  recover(recoverFunction: (err: Error) => T): Future<T> {
    let newPromise = new Promise<T, Error>();

    this.promise.onResolve((err: Error, result: T) => {
      if (err) {
        rejectOnError(newPromise, () => {
          newPromise.fulfill(recoverFunction(err));
        });
        return;
      }

      newPromise.fulfill(result);
    });

    return new Future<T>(newPromise);
  }

  recoverWith(recoverFunction: (err: Error) => Future<T>): Future<T> {
    let newPromise = new Promise<T, Error>();

    this.promise.onResolve((err: Error, result: T) => {
      if (err) {
        rejectOnError(newPromise, () => {
          recoverFunction(err)
          .onComplete((err: Error, result: T) => {
            newPromise.resolve(err, result);
          });
        });
        return;
      }

      newPromise.fulfill(result);
    });

    return new Future<T>(newPromise);
  }

  zip<U>(future: Future<U>): Future<any[]> {
    return Future.sequence<any>([ this, future ]);
  }

  fallbackTo(future: Future<T>): Future<T> {
    let newPromise = new Promise<T, Error>();

    this.onSuccess((result: T) => {
      newPromise.fulfill(result);
    }).onFailure((err: Error) => {
      future.onComplete((err: Error, result: T) => {
        newPromise.resolve(err, result);
      });
    });

    return new Future<T>(newPromise);
  }

  andThen(callback: IFutureCallback<T, Error>) {
    let newPromise = new Promise<T, Error>();
    newPromise.onResolve(callback);

    this.promise.chain(newPromise);

    return new Future<T>(this.promise);
  }


  nodify(callback: (err: Error, result: T) => void) {
    this.promise.onResolve(callback);
  }
}

export = Future;
