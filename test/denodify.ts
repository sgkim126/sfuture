import assert = require('assert');
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
    Future.denodify(addPositive, null, 100, 100)
    .map((value) => {
      assert.equal(value, 200);
    }).nodify(done);
  });

  it('return failed future, if callback returns error', (done: MochaDone) => {
    Future.denodify(addPositive, null, -100, 100)
    .transform(
      (value) => {
        throw new Error('Must not reached here.');
      },
      (err) => {
        assert.equal(err.message, 'lhs');
      }
    ).nodify(done);
  });
});

