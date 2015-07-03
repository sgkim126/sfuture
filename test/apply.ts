import assert = require('assert');
import should = require('./should');
import Future = require('../lib/future');

describe('#apply', () => {
  it('returns a Future object with a callback', () => {
    let future = Future.apply(() => {
      return;
    });
    assert.equal(future.constructor, Future);
  });

  it('returns a successful Future object with return value', (done: MochaDone) => {
    let future = Future.apply(() => {
      return 10;
    });
    assert.equal(future.constructor, Future);

    should.succeed(future, done, (result: number) => {
      assert.equal(result, 10);
    });
  });

  it('returns a failed Future object when callback throws error', (done: MochaDone) => {
    let future = Future.apply(() => {
      throw new Error('error');
    });
    assert.equal(future.constructor, Future);

    should.fail(future, done, (err) => {
      assert.equal(err.message, 'error');
    });
  });
});
