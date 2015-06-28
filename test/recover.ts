import assert = require('assert');
import Future = require('../lib/future');

describe('#recover', () => {
  it('recover returns the same result with successful future.', (done: MochaDone) => {
    let future = Future.successful(120);
    let recoveredFuture = future.recover((err: Error): number => {
      return 100;
    });

    recoveredFuture.onFailure((err: Error) => {
      done(new Error('Must not reached here.'));
    }).onSuccess((result: number) => {
      assert.equal(120, result);
      done();
    });
  });

  it('recover the failed future.', (done: MochaDone) => {
    let future = Future.failed(new Error('Fail'));
    let recoveredFuture = future.recover((err: Error): number => {
      return 100;
    });

    recoveredFuture.onFailure((err: Error) => {
      done(new Error('Must not reached here.'));
    }).onSuccess((result: number) => {
      assert.equal(100, result);
      done();
    });
  });
});

