import assert = require('assert');
import Future = require('../lib/future');

describe('#onComplete', () => {
  it('registers a success callback.', (done: MochaDone) => {
    let future = Future.successful(10);
    future.onComplete((err: Error, result: number) => {
      try {
        assert.ifError(err);
        assert.equal(result, 10);
        done();
      } catch (ex) {
        done(ex);
      }
    });
  });

  it('registers a failure callback.', (done: MochaDone) => {
    let future = Future.failed(new Error('hello, error!'));
    future.onComplete((err: Error) => {
      try {
        assert(err);
        assert.equal(err.message, 'hello, error!');
        done();
      } catch (ex) {
        done(ex);
      }
    });
  });
});
