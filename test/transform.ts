import assert = require('assert');
import Future = require('../lib/future');

describe('#transform', () => {
  it('transformed future of successful future becomes successful future', (done: MochaDone) => {
    let future = Future.successful(100);
    let transformedFuture = future.transform(
      (result: number) => {
        return result * 4;
      },
      (err: Error) => {
        return err;
      }
    );

    transformedFuture.map((result: number) => {
      assert.equal(400, result);
    }).nodify(done);
  });

  it('transformed future of failed future becomes failed future', (done: MochaDone) => {
    let future = Future.failed(new Error('failed'));
    let transformedFuture = future.transform(
      (result: number) => {
        return result * 4;
      },
      (err: Error) => {
        return new Error(err.message + ' failed');
      }
    );

    transformedFuture.transform(
      () => {
        throw new Error('Must not reached here.');
      },
      (err) => {
        assert.equal(err.message, 'failed failed');
      }
    ).nodify(done);
  });
});
