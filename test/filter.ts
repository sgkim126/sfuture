import assert = require('assert');
import should = require('./should');
import Future = require('../lib/future');

describe('#filter', () => {
  it('filter returns the same error when it is already failed.', <T>(done: MochaDone) => {
    let future = Future.failed<T>(new Error('hello, error!'));
    let filteredFuture = future.filter((result: T): boolean => {
      return true;
    });

    should.fail(filteredFuture, done, (err) => {
      assert.equal(err.message, 'hello, error!');
    });
  });

  it('if filter function returns false, the result is failed future.', (done: MochaDone) => {
    let future = Future.successful(1);
    let filteredFuture = future.filter((result: number): boolean => {
      return false;
    });

    should.fail(filteredFuture, done);
  });

  it('if filter function returns true, the result is same as origianl future.', (done: MochaDone) => {
    let future = Future.successful(1);
    let filteredFuture = future.filter((result: number) => {
      return true;
    });

    should.succeed(filteredFuture, done, (value) => {
      assert.equal(value, 1);
    });
  });

  it('returns failed future, if callback throw error.', (done: MochaDone) => {
    let future = Future.successful(1);
    let filteredFuture = future.filter((result: number): boolean => {
      throw new Error('filter fail');
    });

    should.fail(filteredFuture, done, (err) => {
      assert.equal(err.message, 'filter fail');
    });
  });
});
