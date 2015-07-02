import assert = require('assert');
import Future = require('../lib/future');

describe('#fallbackTo', () => {
  it('does not affect on successful future.', (done: MochaDone) => {
    let future1 = Future.successful(100);
    let future2 = Future.successful(120);
    let future3 = future1.fallbackTo(future2);

    future3.map((result: number) => {
      assert.equal(100, result);
    }).nodify(done);
  });

  it('recovers failed future.', (done: MochaDone) => {
    let future1 = Future.failed(new Error('a'));
    let future2 = Future.successful(120);
    let future3 = future1.fallbackTo(future2);

    future3.map((result: number) => {
      assert.equal(120, result);
    }).nodify(done);
  });

  it('returns failed future if the given fails.', (done: MochaDone) => {
    let future1 = Future.failed(new Error('a'));
    let future2 = Future.failed(new Error('b'));
    let future3 = future1.fallbackTo(future2);

    future3.transform(
      (value) => {
        throw new Error('must failed');
      },
      (err) => {
        assert.equal(err.message, 'b');
      }
    ).nodify(done);
  });
});
