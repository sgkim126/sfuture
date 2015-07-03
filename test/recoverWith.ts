import assert = require('assert');
import should = require('./should');
import Future = require('../lib/future');

describe('#recoverWith', () => {
  it('returns the same result with successful future.', (done: MochaDone) => {
    let future = Future.successful(120);
    let recoveredFuture = future.recoverWith((err: Error): Future<number> => {
      return Future.successful(100);
    });

    should.succeed(recoveredFuture, done, (result: number) => {
      assert.equal(result, 120);
    });
  });

  it('recovers the failed future.', (done: MochaDone) => {
    let future = Future.failed(new Error('Fail'));
    let recoveredFuture = future.recoverWith((err: Error): Future<number> => {
      return Future.successful(100);
    });

    should.succeed(recoveredFuture, done, (result: number) => {
      assert.equal(result, 100);
    });
  });

  it('fails when the result is still failed.', (done: MochaDone) => {
    let future = Future.failed(new Error('Fail'));
    let recoveredFuture = future.recoverWith((err: Error): Future<number> => {
      return Future.failed(new Error('Fail 2'));
    });

    should.fail(recoveredFuture, done,  (err: Error) => {
      assert.equal(err.message, 'Fail 2');
    });
  });

  it('returns failed future if callback throw error.', (done: MochaDone) => {
    let future = Future.failed(new Error('Fail'));
    let recoveredFuture = future.recoverWith((err: Error): Future<number> => {
      throw new Error('Fail again');
    });

    should.fail(recoveredFuture, done, (err) => {
      assert.equal(err.message, 'Fail again');
    });
  });
});
