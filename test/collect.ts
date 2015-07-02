import assert = require('assert');
import Future = require('../lib/future');

describe('#collect', () => {
  it('returns the result that partial function is applied.', (done: MochaDone) => {
    let future = Future.successful(-5);
    future.collect((value: number): any => {
      if (value < 0) {
        return -value;
      }
    }).map((value: number) => {
      assert.equal(value, 5);
    }).nodify(done);
  });

  it('returns the failed future if partial function returns undefined.', (done: MochaDone) => {
    let future = Future.successful(-5);
    future.collect((value: number): any => {
      if (value > 0) {
        return value * 2;
      }
    }).transform(
      (value) => {
        throw new Error('must fail');
      },
      (err) => {
        assert(err);
      }
    ).nodify(done);
  });

  it('returns the failed future if partial function throws error.', (done: MochaDone) => {
    let future = Future.successful(-5);
    future.collect((value: number): any => {
      throw new Error('no!!!!');
    }).transform(
      (value: number) => {
        throw new Error('must fail');
      },
      (err) => {
        assert.equal(err.message, 'no!!!!');
      }
    ).nodify(done);
  });
});
