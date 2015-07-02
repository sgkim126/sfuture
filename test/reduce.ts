import assert = require('assert');
import Future = require('../lib/future');

describe('#reduce', () => {
  it('returns failed future when the argument is an empty array', (done: MochaDone) => {
    Future.reduce([], (base: number, result: number) => { return base * result; })
    .transform(
      () => {
        throw new Error('must fail');
      },
      (err) => {
        return;
      }
    ).nodify(done);
  });

  it('returns failed future when one of the future failed', (done: MochaDone) => {
    let f1 = Future.successful(1);
    let f2 = Future.failed(new Error('second future failed'));
    let f3 = Future.successful(1);

    Future.reduce([ f1, f2, f3 ], (base: number, result: number): number => { return base + result; })
    .transform(
      () => {
        throw new Error('must fail');
      },
      (err) => {
        assert.equal(err.message, 'second future failed');
      }
    ).nodify(done);
  });

  it('does not execute op when there is a failed future', (done: MochaDone) => {
    let f1 = Future.successful(1);
    let f2 = Future.failed(new Error('second future failed'));
    let f3 = Future.successful(1);

    let count = 0;

    Future.reduce([ f1, f2, f3 ], (base: number, result: number): number => { return base + result; })
    .transform(
      () => {
        throw new Error('should fail');
      },
      (err) => {
        assert.equal(err.message, 'second future failed');
        assert.equal(count, 0);
      }
    ).nodify(done);
  });

  it('executes sequently', (done: MochaDone) => {
    let f1 = Future.successful(1);
    let f2 = Future.successful(2);
    let f3 = Future.successful(3);

    Future.reduce([ f1, f2, f3 ], (base: number, result: number): number => { return result - base; })
    .map((result: number) => {
      assert.equal(result, 2);
    }).nodify(done);
  });
});
