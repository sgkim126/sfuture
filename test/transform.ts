import assert = require('assert');
import Future = require('../lib/future');

describe('#transform', () => {
  it('transformed future of successful future becomes successful future', (done: MochaDone) => {
    let future = Future.successful(100);
    let transformedFuture = future.transform((err: Error, result: number) => {
      if (err) {
        return err;
      }

      return result * 4;
    });

    transformedFuture.onFailure((err: Error) => {
      done(new Error('Must not reached here.'));
    }).onSuccess((result: number) => {
      assert.equal(400, result);
      done();
    });
  });

  it('transformed future of failed future becomes failed future', <T>(done: MochaDone) => {
    let future = Future.failed(new Error('failed'));
    let transformedFuture = future.transform((err: Error, result: number) => {
      if (err) {
        return new Error(err.message + ' failed');
      }

      return result * 4;
    });

    transformedFuture.onFailure((err: Error) => {
      assert.equal(err.message, 'failed failed');
      done();
    }).onSuccess((result: number) => {
      done(new Error('Must not reached here.'));
    });
  });
});
