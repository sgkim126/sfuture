import assert = require('assert');
import should = require('./should');
import Future = require('../lib/future');

describe('#zip', () => {
  it('returns size 2 array.', (done: MochaDone) => {
    let future1 = Future.successful(1);
    let future2 = Future.successful('a');

    let future = future1.zip(future2);

    should.succeed(future, done, (result: any[]) => {
      assert.equal(result.length, 2);
      assert.equal(result[0], 1);
      assert.equal(result[1], 'a');
    });
  });

  it('fails with the reason that `this` future failed if `this` future failed and `that` future succeeded.', (done: MochaDone) => {
    let future1 = Future.failed(new Error('a'));
    let future2 = Future.successful('b');

    let future = future1.zip(future2);

    should.fail(future, done, (err) => {
      assert.equal(err.message, 'a');
    });
  });

  it('fails with the reason that `that` future failed if `this` future succeeded and `that` future failed.', (done: MochaDone) => {
    let future1 = Future.successful('a');
    let future2 = Future.failed(new Error('b'));

    let future = future1.zip(future2);

    should.fail(future, done, (err) => {
      assert.equal(err.message, 'b');
    });
  });

  it('fails with the reason that `this` future failed if both future failed.', (done: MochaDone) => {
    let future1 = Future.failed(new Error('a'));
    let future2 = Future.failed(new Error('b'));

    let future = future1.zip(future2);

    should.fail(future, done, (err) => {
      assert.equal(err.message, 'a');
    });
  });
});
