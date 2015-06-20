import assert = require('assert');
import Future = require('../lib/future');

describe('#denodifiy', function () {
  let addPositive = (lhs: number, rhs: number, callback: (err: Error, result?: number) => void) => {
    setTimeout(
      function () {
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
    Future.denodify(addPositive, null, 100, 100).onSuccess((result: number) => {
      assert.equal(result, 200);
      done();
    }).onFailure((err: Error) => {
      done(new Error('Must not reached here.'));
    });
  });

  it('return failed future, if callback returns error', (done: MochaDone) => {
    Future.denodify(addPositive, null, -100, 100).onSuccess((result: number) => {
      done(new Error('Must not reached here.'));
    }).onFailure((err: Error) => {
      assert.equal(err.message, 'lhs');
      done();
    });
  });
});

