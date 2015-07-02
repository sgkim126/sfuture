import assert = require('assert');
import Future = require('../lib/future');

describe('#filter', () => {
  it('filter returns the same error when it is already failed.', <T>(done: MochaDone) => {
    let future = Future.failed<T>(new Error('hello, error!'));
    let filteredFuture = future.filter((result: T): boolean => {
      return true;
    });

    filteredFuture.transform(
      (value) => {
        throw new Error('Must not reached here.');
      },
      (err) => {
        assert.equal(err.message, 'hello, error!');
      }
    ).nodify(done);
  });

  it('if filter function returns false, the result is failed future.', (done: MochaDone) => {
    let future = Future.successful(1);
    let filteredFuture = future.filter((result: number): boolean => {
      return false;
    });

    filteredFuture.transform(
      (value) => {
        throw new Error('Must not reached here.');
      },
      (err) => {
        assert(err);
      }
    ).nodify(done);
  });

  it('if filter function returns true, the result is same as origianl future.', (done: MochaDone) => {
    let future = Future.successful(1);
    let filteredFuture = future.filter((result: number) => {
      return true;
    });

    filteredFuture.map((value) => {
      assert.equal(value, 1);
    }).nodify(done);
  });
});
