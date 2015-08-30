import util = require('util');

class Future<T> {
  private promise: Promise<T>;

  constructor(promise: Promise<T>) {
    this.promise = promise;
  }

  static failed<T>(err: any): Future<T> {
    let newPromise = Promise.reject(err);

    return new Future<T>(newPromise);
  }

  static successful<T>(result: T): Future<T> {
    let newPromise = Promise.resolve<T>(result);

    return new Future<T>(newPromise);
  }

  static fromTry<T>(err: any, result: T): Future<T> {
    let newPromise = err ? Promise.reject(err) : Promise.resolve<T>(result);

    return new Future<T>(newPromise);
  }


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


  static sequence<T>(futures: Future<T>[]): Future<T[]> {
    let newPromise = Promise.all(futures.map((f): Promise<T> => {
      return f.promise;
    }));
    return new Future<T[]>(newPromise);
  }

  static firstCompletedOf<T>(futures: Future<T>[]): Future<T> {
    let newPromise = Promise.race(futures.map((f): Promise<T> => {
      return f.promise;
    }));
    return new Future<T>(newPromise);
  }

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

  static fold<T, R>(futures: Future<T>[], base: R, op: (base: R, result: T) => R): Future<R> {
    return Future.sequence(futures)
    .map((results: T[]): R => {
      return results.reduce(op, base);
    });
  }

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

  static traverse<T, R>(args: T[], fn: (result?: T) => Future<R>): Future<R[]> {
    return Future.sequence(args.map(fn));
  }

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

  onSuccess(callback: (result?: T) => void): Future<T> {
    this.promise.then(callback);
    return this;
  }

  onFailure(callback: (err?: any) => void): Future<T> {
    this.promise.catch(callback);
    return this;
  }

  onComplete(callback: (err?: any, result?: T) => void): Future<T> {
    this.promise.then(
      (value: T): void => {
        callback(undefined, value);
      },
      callback
    );
    return this;
  }


  foreach<U>(f: (result?: T) => U): void {
    this.onSuccess(f);
  }

  transform<U>(s: (result?: T) => U, f: (err?: any) => any): Future<U> {
    let newPromise = this.promise.then(
      s,
      (err: any): U => {
        throw f(err);
      }
    );
    return new Future<U>(newPromise);
  }

  map<U>(mapping: (result?: T) => U): Future<U> {
    let newPromise = this.promise.then(mapping);
    return new Future<U>(newPromise);
  }

  flatMap<U>(futuredMapping: (result?: T) => Future<U>): Future<U> {
    let newPromise = this.promise.then(
      (value: T): Promise<U> => {
        return futuredMapping(value)
        .promise;
      }
    );

    return new Future<U>(newPromise);
  }

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

  withFilter(filterFunction: (result?: T) => boolean): Future<T> {
    return this.filter(filterFunction);
  }


  collect<S>(pf: (result?: T) => S): Future<S> {
    return this.map((value: T): S => {
      let result: S = pf(value);
      if (result === undefined) {
        throw new Error(util.format('Future.collect partial function is not defined at: %j', value));
      }

      return result;
    });
  }

  recover(recoverFunction: (err?: any) => T): Future<T> {
    let newPromise = this.promise.catch(recoverFunction);

    return new Future<T>(newPromise);
  }

  recoverWith(recoverFunction: (err?: any) => Future<T>): Future<T> {
    let newPromise = this.promise.catch(
      (err: any): Promise<T> => {
        return recoverFunction(err).promise;
      }
    );

    return new Future<T>(newPromise);
  }

  zip<U>(future: Future<U>): Future<any[]> {
    return Future.sequence<any>([ this, future ]);
  }

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
