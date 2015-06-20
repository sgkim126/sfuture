import assert = require('assert');
import Future = require('../lib/future');

describe('#filter', function () {
  it('filter returns the same error when it is already failed.', function <T>(done: MochaDone) {
    let future = Future.failed<T>(new Error('hello, error!'));
    let filteredFuture = future.filter(function (result: T): boolean {
      return true;
    });

    filteredFuture.onFailure(function (err: Error) {
      assert.equal(err.message, 'hello, error!');
      done();
    }).onSuccess(function (result: T) {
      done(new Error('Must not reached here.'));
    });
  });

  it('if filter function returns false, the result is failed future.', function (done: MochaDone) {
    let future = Future.successful(1);
    let filteredFuture = future.filter(function (result: number): boolean {
      return false;
    });

    filteredFuture.onFailure(function (err: Error) {
      done();
    }).onSuccess(function (result: number) {
      done(new Error('Must not reached here.'));
    });
  });

  it('if filter function returns true, the result is same as origianl future.', function (done: MochaDone) {
    let future = Future.successful(1);
    let filteredFuture = future.filter(function (result: number) {
      return true;
    });

    filteredFuture.onFailure(function (err: Error) {
      done(new Error('Must not reached here.'));
    }).onSuccess(function (result: number) {
      assert.equal(result, 1);
      done();
    });
  });
});
