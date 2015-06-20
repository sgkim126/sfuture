import assert = require('assert');
import Future = require('../lib/future');

describe('#collect', function () {
  it('returns the result that partial function is applied.', function (done: MochaDone) {
    let future = Future.successful(-5);
    future.collect((value: number): any => {
      if (value < 0) {
        return -value;
      }
    }).map((value: number) => {
      assert.equal(value, 5);
    }).nodify(done);
  });

  it('returns the failed future if partial function returns undefined.', function (done: MochaDone) {
    let future = Future.successful(-5);
    future.collect((value: number): any => {
      if (value > 0) {
        return value * 2;
      }
    }).onSuccess((value: number) => {
      done(new Error('must fail'));
    }).onFailure((err: Error) => {
      done();
    });
  });

  it('returns the failed future if partial function throws error.', function (done: MochaDone) {
    let future = Future.successful(-5);
    future.collect((value: number): any => {
      throw new Error('no!!!!');
    }).onSuccess((value: number) => {
      done(new Error('must fail'));
    }).onFailure((err: Error) => {
      try {
        assert.equal(err.message, 'no!!!!');
        done();
      } catch (err) {
        done(err);
      }
    });
  });
});
