import assert = require('assert');
import should = require('./should');
import Future = require('../src/future');

describe('#recover', () => {
  it('recover returns the same result with successful future.', (done: MochaDone) => {
    let future = Future.successful(120);
    let recoveredFuture = future.recover((err: Error): number => {
      return 100;
    });

    should.succeed(recoveredFuture, done, (result: number) => {
      assert.equal(120, result);
    });
  });

  it('recover the failed future.', (done: MochaDone) => {
    let future = Future.failed(new Error('Fail'));
    let recoveredFuture = future.recover((err: Error): number => {
      return 100;
    });

    should.succeed(recoveredFuture, done, (result: number) => {
      assert.equal(100, result);
    });
  });

  it('returns failed future if callback throw error.', (done: MochaDone) => {
    let future = Future.failed(new Error('Fail'));
    let recoveredFuture = future.recover((err: Error): number => {
      throw new Error('Fail again');
    });

    should.fail(recoveredFuture, done, (err) => {
      assert.equal(err.message, 'Fail again');
    });
  });
});
