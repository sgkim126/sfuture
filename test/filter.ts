import assert = require('assert');
import Future = require('../lib/future');

describe('#filter', () => {
  it('filter returns the same error when it is already failed.', <T>(done: MochaDone) => {
    let future = Future.failed<T>(new Error('hello, error!'));
    let filteredFuture = future.filter((result: T): boolean => {
      return true;
    });

    filteredFuture.onFailure((err: Error) => {
      assert.equal(err.message, 'hello, error!');
      done();
    }).onSuccess((result: T) => {
      done(new Error('Must not reached here.'));
    });
  });

  it('if filter function returns false, the result is failed future.', (done: MochaDone) => {
    let future = Future.successful(1);
    let filteredFuture = future.filter((result: number): boolean => {
      return false;
    });

    filteredFuture.onFailure((err: Error) => {
      done();
    }).onSuccess((result: number) => {
      done(new Error('Must not reached here.'));
    });
  });

  it('if filter function returns true, the result is same as origianl future.', (done: MochaDone) => {
    let future = Future.successful(1);
    let filteredFuture = future.filter((result: number) => {
      return true;
    });

    filteredFuture.onFailure((err: Error) => {
      done(new Error('Must not reached here.'));
    }).onSuccess((result: number) => {
      assert.equal(result, 1);
      done();
    });
  });
});
