import assert = require('assert');
import should = require('./should');
import Future = require('../src/future');

describe('#withFilter', () => {
  it('returns the same error when it is already failed.', <T>(done: MochaDone) => {
    let future = Future.failed<T>(new Error('hello, error!'));
    let filteredFuture = future.withFilter((result: T): boolean => {
      return true;
    });

    should.fail(filteredFuture, done, (err: Error) => {
      assert.equal(err.message, 'hello, error!');
    });
  });

  it('if filter function returns false, the result is failed future.', (done: MochaDone) => {
    let future = Future.successful(1);
    let filteredFuture = future.withFilter((result: number): boolean => {
      return false;
    });

    should.fail(filteredFuture, done);
  });

  it('if filter function returns true, the result is same as origianl future.', (done: MochaDone) => {
    let future = Future.successful(1);
    let filteredFuture = future.withFilter((result: number) => {
      return true;
    });

    should.succeed(filteredFuture, done, (result: number) => {
      assert.equal(result, 1);
    });
  });
});

