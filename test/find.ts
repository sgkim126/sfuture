import assert = require('assert');
import should = require('./should');
import Future = require('../lib/future');

describe('#find', () => {
  it('returns null if the array is empty', (done: MochaDone) => {
    let future = Future.find([], () => { return true; });

    should.succeed(future, done, (result) => {
      assert.equal(result, null);
    });
  });

  it('returns null if all results do not satisfy the condition', (done: MochaDone) => {
    let f1 = Future.successful(1);
    let f2 = Future.successful(2);
    let f3 = Future.successful(3);
    let f4 = Future.successful(4);
    let f5 = Future.successful(5);
    let f6 = Future.successful(6);
    let f7 = Future.successful(7);
    let futures = [ f1, f2, f3, f4, f5, f6, f7 ];
    let future = Future.find(futures, () => { return false; });

    should.succeed(future, done, (result) => {
      assert.equal(result, null);
    });
  });

  it('returns the value', (done: MochaDone) => {
    let f1 = Future.successful(1);
    let f2 = Future.successful(2);
    let f3 = Future.successful(3);
    let f4 = Future.successful(4);
    let f5 = Future.successful(5);
    let f6 = Future.successful(6);
    let f7 = Future.successful(7);
    let futures = [ f1, f2, f3, f4, f5, f6, f7 ];
    let future = Future.find(futures, (value: number) => { return value === 4; });

    should.succeed(future, done, (result) => {
      assert.equal(result, 4);
    });
  });

  it('returns the successful value', (done: MochaDone) => {
    let f1 = Future.failed(new Error('a'));
    let f2 = Future.successful(2);
    let futures = [ f1, f2 ];
    let future = Future.find(futures, (value: number) => { return true; });

    should.succeed(future, done, (result) => {
      assert.equal(result, 2);
    });
  });

  it('returns null if all futures are failed', (done: MochaDone) => {
    let f1 = Future.failed(new Error('a'));
    let f2 = Future.failed(new Error('b'));
    let f3 = Future.failed(new Error('c'));
    let f4 = Future.failed(new Error('d'));
    let f5 = Future.failed(new Error('e'));
    let futures = [ f1, f2, f3, f4, f5 ];
    let future = Future.find(futures, (value: number) => { return true; });

    should.succeed(future, done, (result) => {
      assert.equal(result, null);
    });
  });

  it('returns the first completed value regardless of the order in arguments', (done: MochaDone) => {
    let p = new Promise<number>((resolve, reject) => {
      setTimeout(() => { resolve(1); }, 1000);
    });
    let f1 = new Future(p);
    let f2 = Future.successful(2);

    let futures = [ f1, f2 ];
    let future = Future.find(futures, (value: number) => { return true; });

    should.succeed(future, done, (result) => {
      assert.equal(result, 2);
    });
  });

  it('returns null if callback throws error on every cases', (done: MochaDone) => {
    let f1 = Future.successful(1);
    let f2 = Future.successful(2);
    let f3 = Future.successful(3);
    let f4 = Future.successful(4);

    let futures = [ f1, f2, f3, f4 ];
    let future = Future.find(futures, (value: number): boolean => { throw new Error(); });

    should.succeed(future, done, (value: number) => {
      assert.equal(value, null);
    });
  });
});
