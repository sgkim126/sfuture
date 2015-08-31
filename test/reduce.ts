import assert = require('assert');
import should = require('./should');
import Future = require('../src/future');

describe('#reduce', () => {
  it('returns failed future when the argument is an empty array', (done: MochaDone) => {
    let future = Future.reduce([], (base: number, result: number) => { return base * result; });

    should.fail(future, done);
  });

  it('returns failed future when one of the future failed', (done: MochaDone) => {
    let f1 = Future.successful(1);
    let f2 = Future.failed(new Error('second future failed'));
    let f3 = Future.successful(1);

    let future = Future.reduce([ f1, f2, f3 ], (base: number, result: number): number => { return base + result; });

    should.fail(future, done, (err) => {
      assert.equal(err.message, 'second future failed');
    });
  });

  it('does not execute op when there is a failed future', (done: MochaDone) => {
    let f1 = Future.successful(1);
    let f2 = Future.failed(new Error('second future failed'));
    let f3 = Future.successful(1);

    let count = 0;

    let future = Future.reduce([ f1, f2, f3 ], (base: number, result: number): number => { return base + result; });

    should.fail(future, done, (err) => {
      assert.equal(err.message, 'second future failed');
      assert.equal(count, 0);
    });
  });

  it('executes sequently', (done: MochaDone) => {
    let f1 = Future.successful(1);
    let f2 = Future.successful(2);
    let f3 = Future.successful(3);

    let future = Future.reduce([ f1, f2, f3 ], (base: number, result: number): number => { return result - base; });

    should.succeed(future, done, (result: number) => {
      assert.equal(result, 2);
    });
  });

  it('returns failed future if the callback throws error', (done: MochaDone) => {
    let f1 = Future.successful(1);
    let f2 = Future.successful(2);
    let f3 = Future.successful(3);

    let future = Future.reduce([ f1, f2, f3 ], (base: number, result: number): number => { throw new  Error('error'); });

    should.fail(future, done, (err) => {
      assert.equal(err.message, 'error');
    });
  });
});
