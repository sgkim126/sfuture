import assert = require('assert');
import Future = require('../lib/future');

describe('#onComplete', function () {
  it('registers a success callback.', function (done: MochaDone) {
    let future = Future.successful(10);
    future.onComplete((err: Error, result: number) => {
      assert.ifError(err);
      assert.equal(result, 10);
      done();
    });
  });

  it('registers a failure callback.', function (done: MochaDone) {
    let future = Future.failed(new Error('hello, error!'));
    future.onComplete((err: Error) => {
      assert(err);
      assert.equal(err.message, 'hello, error!');
      done();
    });
  });
});
