import util = require('util');

class Future<T> {
  /**
   * @private
   * @type Promise<T>
   */
  private promise: Promise<T>;

  /**
   * Creates a new future with ES6 promise.
   * The new future will be completed when the promise is completed.
   * @class Future<T>
   */
  constructor(promise: Promise<T>) {
    this.promise = promise;
  }

  /**
   * Returns a failed future if err is defined.
   * @method Future.failed
   * @param {any} err
   * @returns {Future<T>}
   */
  static failed<T>(err: any): Future<T> {
    let newPromise = Promise.reject(err);

    return new Future<T>(newPromise);
  }

  /**
   * Returns a successful future that holds the given value.
   * @method Future.successful
   * @param {T} value
   * @returns {Future<T>}
   */
  static successful<T>(result: T): Future<T> {
    let newPromise = Promise.resolve<T>(result);

    return new Future<T>(newPromise);
  }

  /**
   * Returns a failed future if err is defined.
   * Returns a successful future if err is not defined.
   * @method Future.fromTry
   * @param {any} err
   * @param {T} value
   * @returns {Future<T>}
   */
  static fromTry<T>(err: any, result: T): Future<T> {
    let newPromise = err ? Promise.reject(err) : Promise.resolve<T>(result);

    return new Future<T>(newPromise);
  }


  /**
   * Creates a future with callback. Callback will be executed asynchronously.
   * So the future is not completed when it is returned.
   * @method Future.apply
   * @param {ApplyCallback} callback
   * @returns {Future<T>}
   */
  static apply<T>(fn: () => T): Future<T> {
    let newPromise = new Promise<T>((resolve, reject): void => {
      setTimeout(
        (): void => {
          try  {
            let result = fn();
            resolve(result);
          } catch (ex) {
            reject(ex);
          }
        },
        0);
    });
    return new Future<T>(newPromise);
  }


  /**
   * Reduces futures to one future.
   * @method Future.sequence
   * @param {Array.<Future<T>>} futures
   */
  static sequence<T>(futures: Future<T>[]): Future<T[]> {
    let newPromise = Promise.all(futures.map((f): Promise<T> => {
      return f.promise;
    }));
    return new Future<T[]>(newPromise);
  }

  /**
   * Returns the first completed futures.
   * @method Future.firstCompletedOf
   * @param {Array.<Future<T>>} futures
   */
  static firstCompletedOf<T>(futures: Future<T>[]): Future<T> {
    let newPromise = Promise.race(futures.map((f): Promise<T> => {
      return f.promise;
    }));
    return new Future<T>(newPromise);
  }

  /**
   * Returns a future that holds the value which callback returns true.
   * If no value contents the callback, the future holds null.
   * @method Future.find
   * @param {Array.<Future<T>>} futures
   * @param {FilterCallback} callback
   * @returns {Future<T>}
   */
  static find<T>(futures: Future<T>[], predicate: (result?: T) => boolean): Future<T> {
    let count = futures.length;

    if (count === 0) {
      return Future.successful(null);
    }

    let newPromise = new Promise<T>((resolve, reject) => {
      let search: (err?: any, result?: T) => void = (err: any, result: T): void => {
        count -= 1;
        if (!err) {
          try {
            if (predicate(result)) {
              resolve(result);
              return;
            }
          } catch (ex) {
            // Ignore error.
          }
        }

        if (count === 0) {
          resolve(null);
          return;
        }
      };

      futures.map((future: Future<T>): void => {
        future.onComplete(search);
      });
    });

    return new Future(newPromise);
  }

  /**
   * Folds with the given futures and the given base value.
   * The fold will be executed after all the given futures are completed
   * successfully. And returns the first failed future if one of the future
   * is failed
   * @method Future.fold
   * @param {Array.<Future<T>>} futures
   * @param {U} base
   * @param {FoldCallback} callback
   * @returns Future<U>
   */
  static fold<T, R>(futures: Future<T>[], base: R, op: (base: R, result: T) => R): Future<R> {
    return Future.sequence(futures)
    .map((results: T[]): R => {
      return results.reduce(op, base);
    });
  }

  /**
   * Reduces with the given futures and the callback.
   * The reduce will be executed after all the given futures are completed
   * successfully. And returns the first failed future if one of the future
   * is failed
   * @method Future.reduce
   * @param {Array.<Future<T>>} futures
   * @param {FoldCallback} callback
   * @returns Future<T>
   */
  static reduce<T>(futures: Future<T>[], op: (base: T, result: T) => T): Future<T> {
    if (futures.length === 0) {
      return Future.failed(new Error('reduce attempted on empty collection'));
    }

    return Future.sequence(futures)
    .map((results: T[]): T => {
      let remains = results.slice(0);
      let first = remains.shift();

      return remains.reduce(op, first);
    });
  }

  /**
   * Converts T[] to Future<U[]> with T[] and function(T => Future<U>).
   * @method Future.traverse
   * @param {Array.<T>} args
   * @param {FlatMapCallback} callback
   * @returns {Array.<Future<U>>}
   */
  static traverse<T, R>(args: T[], fn: (result?: T) => Future<R>): Future<R[]> {
    return Future.sequence(args.map(fn));
  }

  /**
   * Creates a future with function and it's arguments. The last parameter of
   * function should be the node style callback.
   * @method Future.denodify
   * @param {function} fn
   * @param {any} thisArg
   * @param {...any} args
   * @returns {Future<T>}
   */
  static denodify<T>(fn: Function, thisArg: any, ...args: any[]): Future<T> {
    let newPromise = new Promise<T>((resolve, reject): void => {
      args.push((err: any, result: T): void => {
        if (err) {
          reject(err);
          return;
        }

        resolve(result);
      });

      fn.apply(thisArg, args);
    });
    return new Future<T>(newPromise);
  }

  /**
   * Executes callback when this future is completed successfully.
   * @method Future#onSuccess
   * @param {SuccessCallback} callback
   * @returns {Future<T>}
   */
  onSuccess(callback: (result?: T) => void): Future<T> {
    this.promise.then(callback);
    return this;
  }

  /**
   * Executes callback when this future is failed.
   * @method Future#onFailure
   * @param {FailCallback} callback
   * @returns {Future<T>}
   */
  onFailure(callback: (err?: any) => void): Future<T> {
    this.promise.catch(callback);
    return this;
  }

  /**
   * Executes callback when this future is completed.
   * It is similar to {@link Future#andThen}, but it returns this future itself.
   * @method Future#onComplete
   * @param {TryCallback} callback
   * @returns {Future<T>}
   */
  onComplete(callback: (err?: any, result?: T) => void): Future<T> {
    this.promise.then(
      (value: T): void => {
        callback(undefined, value);
      },
      callback
    );
    return this;
  }


  /**
   * Does nothing when this future failed.
   * If this future completed successfully, executes callback.
   * It is simillar to {@link Future#onSuccess}, but returns void.
   * @method Future#foreach
   * @param {SuccessCallback} callback
   */
  foreach<U>(f: (result?: T) => U): void {
    this.onSuccess(f);
  }

  /**
   * If this future is completed successfully, it returns a future that holds
   * the successCallback applied.
   * And if this future is failed, it returns a failed future. The reason
   * will be the result of failCallback.
   * @method Future#transform
   * @param {SuccessCallback} successCallback
   * @param {FailCallback} failCallback
   * @returns {Future<U>}
   */
  transform<U>(s: (result?: T) => U, f: (err?: any) => any): Future<U> {
    let newPromise = this.promise.then(
      s,
      (err: any): U => {
        throw f(err);
      }
    );
    return new Future<U>(newPromise);
  }

  /**
   * Returns a new future that callback is applied when this future is
   * completed successfully.
   * If this future is failed, the new future will be failed with the same
   * reason with this future.
   * @method Future#map
   * @param {MapCallback} callback
   * @returns {Future<U>}
   */
  map<U>(mapping: (result?: T) => U): Future<U> {
    let newPromise = this.promise.then(mapping);
    return new Future<U>(newPromise);
  }

  /**
   * If this future is completed successfully, returns a new future that is
   * the same with callback result. So callback should return future.
   * If this future is failed, the new future will be failed with the same
   * reason with this future.
   * @method Future#flatMap
   * @param {FlatMapCallback} callback
   * @returns {Future<U>}
   */
  flatMap<U>(futuredMapping: (result?: T) => Future<U>): Future<U> {
    let newPromise = this.promise.then(
      (value: T): Promise<U> => {
        return futuredMapping(value)
        .promise;
      }
    );

    return new Future<U>(newPromise);
  }

  /**
   * Returns a new future that holds the filtered value with callback.
   * If callback returns true, the new future holds the same value with this
   * future. If callback retruns false, the new future will be failed.
   * @method Future#filter
   * @param {FilterCallback} callback
   * @returns {Future<T>}
   */
  filter(filterFunction: (result?: T) => boolean): Future<T> {
    let newPromise = this.promise.then(
      (value: T): T => {
        if (!filterFunction(value)) {
          throw new Error('no.such.element');
        }
        return value;
      }
    );

    return new Future<T>(newPromise);
  }

  /**
   * Same with {@link Future#filter}.
   * @method Future#withFilter
   */
  withFilter(filterFunction: (result?: T) => boolean): Future<T> {
    return this.filter(filterFunction);
  }


  /**
   * Returns a new future that holds the value that callback is applied.
   * Or returns a failed future if callback returns undefined. This callback
   * is applied only when this future is completed successfuly.
   * @method Future#collect
   * @param {SuccessCallback} callback
   * @returns {Future<U>}
   */
  collect<S>(pf: (result?: T) => S): Future<S> {
    return this.map((value: T): S => {
      let result: S = pf(value);
      if (result === undefined) {
        throw new Error(util.format('Future.collect partial function is not defined at: %j', value));
      }

      return result;
    });
  }

  /**
   * Takes a callback and executes callback when this future is failed. And
   * returns new future holds the callback result.
   * @method Future#recover
   * @param {RecoverCallback} callback - It is executed when this future failed.
   * @returns {Future<T>}
   */
  recover(recoverFunction: (err?: any) => T): Future<T> {
    let newPromise = this.promise.catch(recoverFunction);

    return new Future<T>(newPromise);
  }

  /**
   * Takes a callback that returns Future. And executes callback when this
   * future is failed. And returns a new future that is the same with callback
   * result.
   * @method Future#recoverWith
   * @param {RecoverWithCallback} callback - It is executed when this future failed.
   * @returns {Future<T>}
   */
  recoverWith(recoverFunction: (err?: any) => Future<T>): Future<T> {
    let newPromise = this.promise.catch(
      (err: any): Promise<T> => {
        return recoverFunction(err).promise;
      }
    );

    return new Future<T>(newPromise);
  }

  /**
   * Returns a new future that holds the result of this and the passed future.
   * The zip method of scala returns a future of tuple, but sfuture's one
   * holds size 2 array.
   * @method Future#zip
   * @param {Future<U>} future
   * @returns {Future<Array.<any>>} - The array size should be 2.
   */
  zip<U>(future: Future<U>): Future<any[]> {
    return Future.sequence<any>([ this, future ]);
  }

  /**
   * Returns a new future. The new future will be failed when both this future
   * and the passed future is failed. The reason will be the same with this
   * future.
   * The new future holds the same value with this future, if this future is
   * completed successfully. And holds the same value with the passed future,
   * if this future is failed and the passed future is successful.
   * @method Future#fallbackTo
   * @param {Future<T>} future - fallback future
   * @returns {Future<T>}
   */
  fallbackTo(future: Future<T>): Future<T> {
    let newPromise = new Promise<T>((resolve, reject): void => {
      this.onSuccess(resolve)
      .onFailure((err: any): void => {
        future.onSuccess(resolve)
        .onFailure((_: any): void => {
          reject(err);
        });
      });
    });

    return new Future<T>(newPromise);
  }

  /**
   * Applies the side-effect function and returns a new future with the result
   * of this future.
   * The result future is completed after this future is completed. So andThen
   * chains keeps the order.
   * @method Future#andThen
   * @param {TryCallback} callback
   * @returns {Future<T>} Holds the same result with this future.
   */
  andThen(callback: (err?: any, result?: T) => void): Future<T> {
    let newPromise = this.promise.then(
      (value: T): T => {
        try {
          callback(undefined, value);
        } catch (ex) {
          return value;
        }
        return value;
      },
      (err: any): void => {
        try {
          callback(err);
        } catch (ex) {
          throw err;
        }
        throw err;
      }
    );

    return new Future<T>(newPromise);
  }


  /**
   * Receives node-style callback. The callback is executed after this future
   * completed.
   * @method Future#nodify
   * @param {TryCallback} callback
   */
  nodify(callback: (err?: any, result?: T) => void): void {
    this.promise.then(
      (value: T): void => {
        callback(undefined, value);
      },
      callback
    );
  }
}

export = Future;

/**
 * @callback ApplyCallback
 * @returns T
 */
/**
 * @callback TryCallback
 * @param {any} err
 * @param {T} value
 */
/**
 * @callback SuccessCallback
 * @param {T} value
 * @returns {U}
 */
/**
 * @callback FailCallback
 * @param {any} err
 * @returns {any}
 */
/**
 * @callback RecoverCallback
 * @param {any} err
 * @returns {T}
 */
/**
 * @callback RecoverWithCallback
 * @param {any} err
 * @returns {Future<T>}
 */
/**
 * @callback FilterCallback
 * @param {T} value
 * @returns {boolean}
 */
/**
 * @callback MapCallback
 * @param {T} value
 * @returns {U}
 */
/**
 * @callback FlatMapCallback
 * @param {T} value
 * @returns {Future<U>}
 */
/**
 * @callback FoldCallback
 * @param {U} base
 * @param {T} value
 * @returns U
 */
