import assert = require('assert');
import Future = require('../lib/future');

describe('Future', function () {
  it('returns a Future object with a callback', function () {
    let future = Future.create(function () {
      return;
    });
    assert.equal(future.constructor, Future);
  });

  it('returns a successful Future object with return value', function (done: MochaDone) {
    let future = Future.create(function () {
      return 10;
    });
    assert.equal(future.constructor, Future);
    future.onSuccess(function (result: number) {
      assert.equal(result, 10);
      done();
    }).onFailure(function (err: Error) {
      done(new Error('Must not reached here.'));
    });
  });

  it('returns a failed Future object when callback throws error', function (done: MochaDone) {
    let future = Future.create(function () {
      throw new Error('error');
    });
    assert.equal(future.constructor, Future);
    future.onFailure(function (err: Error) {
      assert.equal(err.message, 'error');
      done();
    }).onSuccess(function (result) {
      done(new Error('Must not reached here.'));
    });
  });

  it('creates an already completed successful future with the specified result.', function (done: MochaDone) {
    let future = Future.successful('hello');
    future.onSuccess(function (result: string) {
      assert.equal(result, 'hello');
      done();
    }).onFailure(function (err: Error) {
      done(new Error('Must not reached here.'));
    });
  });

  it('creates an already completed failed future with the specified result.', function (done: MochaDone) {
    let future = Future.failed(new Error('error'));
    future.onFailure(function (err: Error) {
      assert.equal(err.message, 'error');
      done();
    }).onSuccess(function (result) {
      done(new Error('Must not reached here.'));
    });
  });
});
