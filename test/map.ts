import assert = require('assert');
import should = require('./should');
import Future = require('../lib/future');

describe('#map', () => {
  it('maps the result of a Future into another result.', (done: MochaDone) => {
    let future = Future.successful(10);
    let mapedFuture = future.map((result: number) => {
      return result + ' times!';
    });

    should.succeed(mapedFuture, done, (result: string) => {
      assert.equal(result, '10 times!');
    });
  });

  it('returns failed future when the original future is failed.', (done: MochaDone) => {
    let future = Future.failed(new Error('hello, error!'));
    let mapedFuture = future.map((result: number) => {
      return result + ' times!';
    });

    should.fail(mapedFuture, done, (err) => {
      assert.equal(err.message, 'hello, error!');
    });
  });

  it('returns the failed future if the callback throw error', (done: MochaDone) => {
    let future = Future.successful(10);
    let mapedFuture = future.map((result: number) => {
      throw new Error('failed');
    });

    should.fail(mapedFuture, done, (err) => {
      assert.equal(err.message, 'failed');
    });
  });
});
