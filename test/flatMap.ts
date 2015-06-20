import assert = require('assert');
import Future = require('../lib/future');

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
