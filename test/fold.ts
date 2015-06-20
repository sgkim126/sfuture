import assert = require('assert');
import Future = require('../lib/future');

describe('#fold', () => {
  it('returns successful future that holds base when the argument is an empty array', (done: MochaDone) => {
    Future.fold([], 1, (base: number, result: number) => { return base * result; })
    .map((result: number) => {
      assert.equal(result, 1);
    }).nodify(done);
  });

  it('returns successful future that holds base when the argument is an empty array even the op throws error', (done: MochaDone) => {
    Future.fold([], 0, (base: number, result: number): number => { throw new  Error('error'); })
    .map((result: number) => {
      assert.equal(result, 0);
    }).nodify(done);
  });

  it('returns failed future when one of the future failed', (done: MochaDone) => {
    let f1 = Future.successful(1);
    let f2 = Future.failed(new Error('second future failed'));
    let f3 = Future.successful(1);

    Future.fold([ f1, f2, f3 ], 0, (base: number, result: number): number => { return base + result; })
    .onSuccess((result: number) => {
      done(new Error('should fail'));
    }).recover((err: Error): number => {
      assert.equal(err.message, 'second future failed');
      return 0;
    }).nodify(done);
  });

  it('does not execute op when there is a failed future', (done: MochaDone) => {
    let f1 = Future.successful(1);
    let f2 = Future.failed(new Error('second future failed'));
    let f3 = Future.successful(1);

    let count = 0;

    Future.fold([ f1, f2, f3 ], 0, (base: number, result: number): number => { return base + result; })
    .onSuccess((result: number) => {
      done(new Error('should fail'));
    }).recover((err: Error): number => {
      assert.equal(err.message, 'second future failed');
      assert.equal(count, 0);
      return 0;
    }).nodify(done);
  });

  it('executes sequently', (done: MochaDone) => {
    let f1 = Future.successful(1);
    let f2 = Future.successful(2);
    let f3 = Future.successful(3);

    Future.fold([ f1, f2, f3 ], 1, (base: number, result: number): number => { return result - base; })
    .map((result: number) => {
      assert.equal(result, 1);
    }).nodify(done);
  });
});
