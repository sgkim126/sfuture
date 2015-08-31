import assert = require('assert');
import should = require('./should');
import Future = require('../src/future');

describe('#collect', () => {
  it('returns the result that partial function is applied.', (done: MochaDone) => {
    let future = Future.successful(-5)
    .collect((value: number): any => {
      if (value < 0) {
        return -value;
      }
    });

    should.succeed(future, done, (value: number) => {
      assert.equal(value, 5);
    });
  });

  it('returns the failed future if partial function returns undefined.', (done: MochaDone) => {
    let future = Future.successful(-5)
    .collect((value: number): any => {
      if (value > 0) {
        return value * 2;
      }
    });

    should.fail(future, done);
  });

  it('returns the failed future if partial function throws error.', (done: MochaDone) => {
    let future = Future.successful(-5)
    .collect((value: number): any => {
      throw new Error('no!!!!');
    });

    should.fail(future, done, (err) => {
      assert.equal(err.message, 'no!!!!');
    });
  });
});
