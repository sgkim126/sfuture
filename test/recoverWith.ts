import assert = require('assert');
import Future = require('../lib/future');

describe('#recoverWith', () => {
  it('returns the same result with successful future.', (done: MochaDone) => {
    let future = Future.successful(120);
    let recoveredFuture = future.recoverWith((err: Error): Future<number> => {
      return Future.successful(100);
    });

    recoveredFuture.map((result: number) => {
      assert.equal(result, 120);
    }).nodify(done);
  });

  it('recovers the failed future.', (done: MochaDone) => {
    let future = Future.failed(new Error('Fail'));
    let recoveredFuture = future.recoverWith((err: Error): Future<number> => {
      return Future.successful(100);
    });

    recoveredFuture.map((result: number) => {
      assert.equal(result, 100);
    }).nodify(done);
  });

  it('fails when the result is still failed.', (done: MochaDone) => {
    let future = Future.failed(new Error('Fail'));
    let recoveredFuture = future.recoverWith((err: Error): Future<number> => {
      return Future.failed(new Error('Fail 2'));
    });

    recoveredFuture.transform(
      () => {
        throw new Error('must fail');
      },
      (err: Error) => {
        assert.equal(err.message, 'Fail 2');
      }
    ).nodify(done);
  });
});
