import assert = require('assert');
import Future = require('../lib/future');
import should = require('./should');

describe('#andThen', () => {
  it('should be called sequencial.', (done: MochaDone) => {
    let sequence = 0;
    let future = Future.successful(100)
    .andThen((err: Error, result: number) => {
      assert.ifError(err);
      assert.equal(result, 100);

      assert.equal(sequence, 0);

      sequence += 1;
    }).andThen((err: Error, result: number) => {
      assert.ifError(err);
      assert.equal(result, 100);

      assert.equal(sequence, 1);

      sequence += 10;
    }).andThen((err: Error, result: number) => {
      assert.ifError(err);
      assert.equal(result, 100);

      assert.equal(sequence, 11);

      sequence += 100;
    });

    should.succeed(future, done, (result: number) => {
      assert.equal(result, 100);

      assert.equal(sequence, 111);
    });
  });

  it('should be called sequencial on failed future.', (done: MochaDone) => {
    let sequence = 0;
    let future = Future.failed(new Error('error'))
    .andThen((err: Error, result: number) => {
      assert.equal(err.message, 'error');
      assert.equal(result, undefined);

      assert.equal(sequence, 0);

      sequence += 1;
    }).andThen((err: Error, result: number) => {
      assert.equal(err.message, 'error');
      assert.equal(result, undefined);

      assert.equal(sequence, 1);

      sequence += 10;
    }).andThen((err: Error, result: number) => {
      assert.equal(err.message, 'error');
      assert.equal(result, undefined);

      assert.equal(sequence, 11);

      sequence += 100;
    });

    should.fail(future, done, (err) => {
      assert.equal(err.message, 'error');

      assert.equal(sequence, 111);
    });
  });

  it('should keep the value even it throws error', (done: MochaDone) => {
    let sequence = 0;
    let future = Future.successful(100)
    .andThen((err: Error, result: number) => {
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
    });

    should.succeed(future, done, (result: number) => {
      assert.equal(result, 100);

      assert.equal(sequence, 111);
    });
  });

  it('should keep the failed reason even the callback throws error.', (done: MochaDone) => {
    let sequence = 0;
    let future = Future.failed(new Error('error'))
    .andThen((err: Error, result: number) => {
      assert.equal(err.message, 'error');
      assert.equal(result, undefined);

      assert.equal(sequence, 0);

      sequence += 1;

      throw new Error();
    }).andThen((err: Error, result: number) => {
      assert.equal(err.message, 'error');
      assert.equal(result, undefined);

      assert.equal(sequence, 1);

      sequence += 10;

      throw new Error();
    }).andThen((err: Error, result: number) => {
      assert.equal(err.message, 'error');
      assert.equal(result, undefined);

      assert.equal(sequence, 11);

      sequence += 100;

      throw new Error();
    });

    should.fail(future, done, (err) => {
      assert.equal(err.message, 'error');

      assert.equal(sequence, 111);
    });
  });
});
