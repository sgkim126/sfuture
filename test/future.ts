import assert = require('assert');
import Future = require('../lib/future');

describe('Future', function () {
  describe('constructor', function () {
    it('returns a Future object with a callback', function () {
      let future = Future.create(function () {
        return;
      });
      assert.equal(future.constructor, Future);
    });

    it('returns a successful Future object with return value', function (done: MochaDone) {
      let future = Future.create(function () {
        return 10;
      });
      assert.equal(future.constructor, Future);
      future.onSuccess(function (result: number) {
        assert.equal(result, 10);
        done();
      }).onFailure(function (err: Error) {
        done(new Error('Must not reached here.'));
      });
    });

    it('returns a failed Future object when callback throws error', function (done: MochaDone) {
      let future = Future.create(function () {
        throw new Error('error');
      });
      assert.equal(future.constructor, Future);
      future.onFailure(function (err: Error) {
        assert.equal(err.message, 'error');
        done();
      }).onSuccess(function (result) {
        done(new Error('Must not reached here.'));
      });
    });

    it('creates an already completed successful future with the specified result.', function (done: MochaDone) {
      let future = Future.successful('hello');
      future.onSuccess(function (result: string) {
        assert.equal(result, 'hello');
        done();
      }).onFailure(function (err: Error) {
        done(new Error('Must not reached here.'));
      });
    });

    it('creates an already completed failed future with the specified result.', function (done: MochaDone) {
      let future = Future.failed(new Error('error'));
      future.onFailure(function (err: Error) {
        assert.equal(err.message, 'error');
        done();
      }).onSuccess(function (result) {
        done(new Error('Must not reached here.'));
      });
    });
  });

  describe('#onComplete', function () {
    it('registers a success callback.', function (done: MochaDone) {
      let future = Future.successful(10);
      future.onComplete((err: Error, result: number) => {
        assert.ifError(err);
        assert.equal(result, 10);
        done();
      });
    });

    it('registers a failure callback.', function (done: MochaDone) {
      let future = Future.failed(new Error('hello, error!'));
      future.onComplete((err: Error) => {
        assert(err);
        assert.equal(err.message, 'hello, error!');
        done();
      });
    });
  });

  describe('#onSuccess', function () {
    it('registers a success callback.', function (done: MochaDone) {
      let future = Future.successful(10);
      future.onSuccess(function (result) {
        assert.equal(result, 10);
        done();
      }).onFailure(function (err: Error) {
        done(new Error('Must not reached here.'));
      });
    });
  });

  describe('#onFailure', function () {
    it('registers a failure callback.', function (done: MochaDone) {
      let future = Future.failed(new Error('hello, error!'));
      future.onFailure(function (err) {
        assert.equal(err.message, 'hello, error!');
        done();
      }).onSuccess(function (result) {
        done(new Error('Must not reached here.'));
      });
    });
  });

  describe('#map', function () {
    it('maps the result of a Future into another result.', function (done: MochaDone) {
      let future = Future.successful(10);
      let mapedFuture = future.map(function (result: number) {
        return result + ' times!';
      });
      mapedFuture.onSuccess(function (result: string) {
        assert.equal(result, '10 times!');
        done();
      }).onFailure(function (err: Error) {
        done(new Error('Must not reached here.'));
      });
    });

    it('throws error when the original future throws error.', function (done: MochaDone) {
      let future = Future.failed(new Error('hello, error!'));
      let mapedFuture = future.map(function (result: number) {
        return result + ' times!';
      });
      mapedFuture.onFailure(function (err) {
        assert.equal(err.message, 'hello, error!');
        done();
      }).onSuccess(function (result) {
        done(new Error('Must not reached here.'));
      });
    });
  });

  describe('#flatMap', function () {
    it('maps the result of a Future into another futured result.', function (done: MochaDone) {
      let future = Future.successful(10);
      let flatMappedFuture = future.flatMap(function (result: number) {
        let future = Future.successful(result + ' times!');
        return future;
      });
      flatMappedFuture.onSuccess(function (result: string) {
        assert.equal(result, '10 times!');
        done();
      }).onFailure(function (err: Error) {
        done(new Error('Must not reached here.'));
      });
    });

    it('throws error when the original future throws error.', function (done: MochaDone) {
      let future = Future.failed(new Error('hello, error!'));
      let flatMappedFuture = future.flatMap(function (result: number) {
        let future = Future.successful(result + ' times!');
        return future;
      });
      flatMappedFuture.onFailure(function (err) {
        assert.equal(err.message, 'hello, error!');
        done();
      }).onSuccess(function (result) {
        done(new Error('Must not reached here.'));
      });
    });

    it('throws error when a mapped future throws error.', function (done: MochaDone) {
      let future = Future.successful(10);
      let flatMappedFuture = future.flatMap(function (result: number): Future<number> {
        throw new Error('hello, error!');
      });
      flatMappedFuture.onFailure(function (err) {
        assert.equal(err.message, 'hello, error!');
        done();
      }).onSuccess(function (result) {
        done(new Error('Must not reached here.'));
      });
    });

    it('return failed future if callback returns failed future.', (done: MochaDone) => {
      let future = Future.successful(10);
      let flatMappedFuture = future.flatMap(function (result: number): Future<number> {
        return Future.failed(new Error('hello, error!'));
      });
      flatMappedFuture.onFailure(function (err) {
        assert.equal(err.message, 'hello, error!');
        done();
      }).onSuccess(function (result) {
        done(new Error('Must not reached here.'));
      });
    });
  });

  describe('#filter', function () {
    it('filter returns the same error when it is already failed.', function <T>(done: MochaDone) {
      let future = Future.failed<T>(new Error('hello, error!'));
      let filteredFuture = future.filter(function (result: T): boolean {
        return true;
      });

      filteredFuture.onFailure(function (err: Error) {
        assert.equal(err.message, 'hello, error!');
        done();
      }).onSuccess(function (result: T) {
        done(new Error('Must not reached here.'));
      });
    });

    it('if filter function returns false, the result is failed future.', function (done: MochaDone) {
      let future = Future.successful(1);
      let filteredFuture = future.filter(function (result: number): boolean {
        return false;
      });

      filteredFuture.onFailure(function (err: Error) {
        done();
      }).onSuccess(function (result: number) {
        done(new Error('Must not reached here.'));
      });
    });

    it('if filter function returns true, the result is same as origianl future.', function (done: MochaDone) {
      let future = Future.successful(1);
      let filteredFuture = future.filter(function (result: number) {
        return true;
      });

      filteredFuture.onFailure(function (err: Error) {
        done(new Error('Must not reached here.'));
      }).onSuccess(function (result: number) {
        assert.equal(result, 1);
        done();
      });
    });
  });

  describe('#recover', function () {
    it('recover returns the same result with successful future.', function (done: MochaDone) {
      let future = Future.successful(120);
      let recoveredFuture = future.recover(function (err: Error): number {
        return 100;
      });

      recoveredFuture.onFailure(function (err: Error) {
        done(new Error('Must not reached here.'));
      }).onSuccess(function (result: number) {
        assert.equal(120, result);
        done();
      });
    });

    it('recover the failed future.', function (done: MochaDone) {
      let future = Future.failed(new Error('Fail'));
      let recoveredFuture = future.recover(function (err: Error): number {
        return 100;
      });

      recoveredFuture.onFailure(function (err: Error) {
        done(new Error('Must not reached here.'));
      }).onSuccess(function (result: number) {
        assert.equal(100, result);
        done();
      });
    });
  });

  describe('#transform', () => {
    it('transformed future of successful future becomes successful future', (done: MochaDone) => {
      let future = Future.successful(100);
      let transformedFuture = future.transform((err: Error, result: number) => {
        if (err) {
          return err;
        }

        return result * 4;
      });

      transformedFuture.onFailure((err: Error) => {
        done(new Error('Must not reached here.'));
      }).onSuccess((result: number) => {
        assert.equal(400, result);
        done();
      });
    });

    it('transformed future of failed future becomes failed future', <T>(done: MochaDone) => {
      let future = Future.failed(new Error('failed'));
      let transformedFuture = future.transform((err: Error, result: number) => {
        if (err) {
          return new Error(err.message + ' failed');
        }

        return result * 4;
      });

      transformedFuture.onFailure((err: Error) => {
        assert.equal(err.message, 'failed failed');
        done();
      }).onSuccess((result: number) => {
        done(new Error('Must not reached here.'));
      });
    });
  });

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
  });

  describe('#sequence', function () {
    it('collects futures and returns a new future of their results.', function (done: MochaDone) {
      let future: Future<any[]> = Future.sequence([
        Future.successful(10),
        Future.successful('hello'),
        Future.successful(20)
      ]);
      future.onSuccess(function (results) {
        assert.equal(results[0], 10);
        assert.equal(results[1], 'hello');
        assert.equal(results[2], 20);
        done();
      }).onFailure(function (err: Error) {
        done(new Error('Must not reached here.'));
      });
    });

    it('Future.sequence(empty array) returns empty array', function (done: MochaDone) {
      let future: Future<any[]> = Future.sequence([
      ]);
      future.map(function (results) {
        assert.equal(results.length, 0);
        done();
      }).onFailure(function (err: Error) {
        done(new Error('Must not reached here.'));
      });
    });

    it('throws an error when any of futures has failed.', function (done: MochaDone) {
      let future: Future<any[]> = Future.sequence([
        Future.failed(new Error('hello, error!')),
        Future.successful(10),
        Future.successful('hello')
      ]);
      future.onFailure(function (err) {
        assert.equal(err.message, 'hello, error!');
        done();
      }).onSuccess(function (result) {
        done(new Error('Must not reached here.'));
      });
    });
  });

  describe('#denodifiy', function () {
    let addPositive = (lhs: number, rhs: number, callback: (err: Error, result?: number) => void) => {
      setTimeout(
        function () {
          if (lhs < 0) {
            callback(new Error('lhs'));
            return;
          }
          if (rhs < 0) {
            callback(new Error('rhs'));
            return;
          }

          callback(null, lhs + rhs);
        },
        10);
    };

    it('return successful future, if callback returns result', (done: MochaDone) => {
      Future.denodify(addPositive, null, 100, 100).onSuccess((result: number) => {
        assert.equal(result, 200);
        done();
      }).onFailure((err: Error) => {
        done(new Error('Must not reached here.'));
      });
    });

    it('return failed future, if callback returns error', (done: MochaDone) => {
      Future.denodify(addPositive, null, -100, 100).onSuccess((result: number) => {
        done(new Error('Must not reached here.'));
      }).onFailure((err: Error) => {
        assert.equal(err.message, 'lhs');
        done();
      });
    });
  });

  describe('#nodify', function () {
    it('successful future calls callback with result', (done: MochaDone) => {
      Future.successful(100).nodify((err: Error, result: number) => {
        assert.ifError(err);
        assert.equal(result, 100);
        done();
      });
    });

    it('failed future calls callback with error', (done: MochaDone) => {
      Future.failed(new Error('error')).nodify((err: Error, result: number) => {
        assert.equal(err.message, 'error');
        assert.strictEqual(result, undefined);
        done();
      });
    });
  });
});
