import assert = require('assert');
import should = require('./should');
import Future = require('../lib/future');

describe('#denodifiy', () => {
  let addPositive = (lhs: number, rhs: number, callback: (err: Error, result?: number) => void) => {
    setTimeout(
      () => {
        if (lhs < 0) {
          callback(new Error('lhs'));
          return;
        }
        if (rhs < 0) {
          callback(new Error('rhs'));
          return;
        }

        callback(null, lhs + rhs);
      },
      10);
  };

  it('return successful future, if callback returns result', (done: MochaDone) => {
    let future = Future.denodify(addPositive, null, 100, 100);


    should.succeed(future, done, (value) => {
      assert.equal(value, 200);
    });
  });

  it('return failed future, if callback returns error', (done: MochaDone) => {
    let future = Future.denodify(addPositive, null, -100, 100);

    should.fail(future, done, (err) => {
      assert.equal(err.message, 'lhs');
    });
  });

  it('returns failed future, if callback throws error', (done: MochaDone) => {
    let addPositive = (lhs: number, rhs: number, callback: (err: Error, result?: number) => void) => {
      throw new Error('throw');
    };

    let future = Future.denodify(addPositive, null, -100, 100);

    should.fail(future, done, (err) => {
      assert.equal(err.message, 'throw');
    });
  });
});
