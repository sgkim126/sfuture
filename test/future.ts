import assert = require('assert');
import Future = require('../lib/future');

describe('Future', () => {
  it('returns a Future object with a callback', () => {
    let future = Future.create(() => {
      return;
    });
    assert.equal(future.constructor, Future);
  });

  it('returns a successful Future object with return value', (done: MochaDone) => {
    let future = Future.create(() => {
      return 10;
    });
    assert.equal(future.constructor, Future);
    future.onSuccess((result: number) => {
      assert.equal(result, 10);
      done();
    }).onFailure((err: Error) => {
      done(new Error('Must not reached here.'));
    });
  });

  it('returns a failed Future object when callback throws error', (done: MochaDone) => {
    let future = Future.create(() => {
      throw new Error('error');
    });
    assert.equal(future.constructor, Future);
    future.onFailure((err: Error) => {
      assert.equal(err.message, 'error');
      done();
    }).onSuccess((result) => {
      done(new Error('Must not reached here.'));
    });
  });

  it('creates an already completed successful future with the specified result.', (done: MochaDone) => {
    let future = Future.successful('hello');
    future.onSuccess((result: string) => {
      assert.equal(result, 'hello');
      done();
    }).onFailure((err: Error) => {
      done(new Error('Must not reached here.'));
    });
  });

  it('creates an already completed failed future with the specified result.', (done: MochaDone) => {
    let future = Future.failed(new Error('error'));
    future.onFailure((err: Error) => {
      assert.equal(err.message, 'error');
      done();
    }).onSuccess((result) => {
      done(new Error('Must not reached here.'));
    });
  });
});
