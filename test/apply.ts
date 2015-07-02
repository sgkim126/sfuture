import assert = require('assert');
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

    future.map((result: number) => {
      assert.equal(result, 10);
    }).nodify(done);
  });

  it('returns a failed Future object when callback throws error', (done: MochaDone) => {
    let future = Future.apply(() => {
      throw new Error('error');
    });
    assert.equal(future.constructor, Future);

    future.transform(
      (result) => {
        throw new Error('Must not reached here.');
      },
      (err) => {
        assert.equal(err.message, 'error');
      }
    ).nodify(done);
  });
});
