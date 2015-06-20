import assert = require('assert');
import Future = require('../lib/future');

describe('#recover', function () {
  it('recover returns the same result with successful future.', function (done: MochaDone) {
    let future = Future.successful(120);
    let recoveredFuture = future.recover(function (err: Error): number {
      return 100;
    });

    recoveredFuture.onFailure(function (err: Error) {
      done(new Error('Must not reached here.'));
    }).onSuccess(function (result: number) {
      assert.equal(120, result);
      done();
    });
  });

  it('recover the failed future.', function (done: MochaDone) {
    let future = Future.failed(new Error('Fail'));
    let recoveredFuture = future.recover(function (err: Error): number {
      return 100;
    });

    recoveredFuture.onFailure(function (err: Error) {
      done(new Error('Must not reached here.'));
    }).onSuccess(function (result: number) {
      assert.equal(100, result);
      done();
    });
  });
});

