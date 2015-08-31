import assert = require('assert');
import should = require('./should');
import Future = require('../src/future');

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

    should.succeed(transformedFuture, done, (result: number) => {
      assert.equal(400, result);
    });
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

    should.fail(transformedFuture, done, (err) => {
      assert.equal(err.message, 'failed failed');
    });
  });

  it('returns failed future if callback throw error', (done: MochaDone) => {
    let future = Future.successful(100);
    let transformedFuture = future.transform(
      (result: number) => {
        throw new Error('error');
      },
      (err: Error) => {
        return err;
      }
    );

    should.fail(transformedFuture, done, (err) => {
      assert.equal(err.message, 'error');
    });
  });

  it('returns failed future if error callback throw error', (done: MochaDone) => {
    let future = Future.failed(new Error('failed'));
    let transformedFuture = future.transform(
      (result: number) => {
        return result * 4;
      },
      (err: Error) => {
        throw new Error('failed 2');
      }
    );

    should.fail(transformedFuture, done, (err) => {
      assert.equal(err.message, 'failed 2');
    });
  });
});
