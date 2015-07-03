import assert = require('assert');
import should = require('./should');
import Future = require('../lib/future');

describe('#fallbackTo', () => {
  it('does not affect on successful future.', (done: MochaDone) => {
    let future1 = Future.successful(100);
    let future2 = Future.successful(120);
    let future3 = future1.fallbackTo(future2);

    should.succeed(future3, done, (result: number) => {
      assert.equal(result, 100);
    });
  });

  it('recovers failed future.', (done: MochaDone) => {
    let future1 = Future.failed(new Error('a'));
    let future2 = Future.successful(120);
    let future3 = future1.fallbackTo(future2);

    should.succeed(future3, done, (result: number) => {
      assert.equal(result, 120);
    });
  });

  it('returns failed future if the given fails.', (done: MochaDone) => {
    let future1 = Future.failed(new Error('a'));
    let future2 = Future.failed(new Error('b'));
    let future3 = future1.fallbackTo(future2);

    should.fail(future3, done, (err) => {
      assert.equal(err.message, 'b');
    });
  });
});
