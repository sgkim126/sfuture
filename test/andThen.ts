import assert = require('assert');
import Future = require('../lib/future');

describe('#andThen', () => {
  it('andThen has to be called sequencial.', (done: MochaDone) => {
    let sequence = 0;
    let future = Future.successful(100);
    future.andThen((err: Error, result: number) => {
      assert.equal(null, err);
      assert.equal(0, sequence);
      sequence += 1;
    }).andThen((err: Error, result: number) => {
      assert.equal(null, err);
      assert.equal(1, sequence);
      sequence += 10;
    }).andThen((err: Error, result: number) => {
      assert.equal(null, err);
      assert.equal(11, sequence);
      sequence += 100;
    }).onComplete((err: Error, result: number) => {
      assert.ifError(err);

      assert.equal(result, 100);
      assert.equal(sequence, 111);
      done();
    });
  });

  it('should keep the value even it throws error', (done: MochaDone) => {
    let sequence = 0;
    let future = Future.successful(100);
    future.andThen((err: Error, result: number) => {
      assert.ifError(err);
      assert.equal(result, 100);

      assert.equal(sequence, 0);
      sequence += 1;

      throw new Error();
    }).andThen((err: Error, result: number) => {
      assert.ifError(err);
      assert.equal(result, 100);

      assert.equal(sequence, 1);
      sequence += 10;

      throw new Error();
    }).andThen((err: Error, result: number) => {
      assert.ifError(err);
      assert.equal(result, 100);

      assert.equal(sequence, 11);
      sequence += 100;

      throw new Error();
    }).map((result: number) => {
      assert.equal(result, 100);

      assert.equal(sequence, 111);
    }).nodify(done);
  });
});
