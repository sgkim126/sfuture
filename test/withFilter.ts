import assert = require('assert');
import Future = require('../lib/future');

describe('#withFilter', () => {
  it('returns the same error when it is already failed.', <T>(done: MochaDone) => {
    let future = Future.failed<T>(new Error('hello, error!'));
    let filteredFuture = future.withFilter((result: T): boolean => {
      return true;
    });

    filteredFuture.transform(
      () => {
        throw new Error('Must not reached here.');
      },
      (err: Error) => {
        assert.equal(err.message, 'hello, error!');
      }
    ).nodify(done);
  });

  it('if filter function returns false, the result is failed future.', (done: MochaDone) => {
    let future = Future.successful(1);
    let filteredFuture = future.withFilter((result: number): boolean => {
      return false;
    });

    filteredFuture.transform(
      () => {
        throw new Error('Must not reached here.');
      },
      (err: Error) => {
        return;
      }
    ).nodify(done);
  });

  it('if filter function returns true, the result is same as origianl future.', (done: MochaDone) => {
    let future = Future.successful(1);
    let filteredFuture = future.withFilter((result: number) => {
      return true;
    });

    filteredFuture.map((result: number) => {
      assert.equal(result, 1);
    }).nodify(done);
  });
});

