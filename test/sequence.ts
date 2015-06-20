import assert = require('assert');
import Future = require('../lib/future');

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

  it('Future.sequence(Future<any[]>) returns Future<any[][]>', function (done: MochaDone) {
    let f1 = Future.successful([1, 2]);
    let f2 = Future.successful([3]);
    let f3 = Future.successful([4, 5, 6]);
    let future: Future<any[]> = Future.sequence([
      f1, f2, f3
    ]);

    future.map(function (results) {
      assert.deepEqual(results, [ [ 1, 2 ], [ 3 ], [ 4, 5, 6 ] ]);
      done();
    }).onFailure(function (err: Error) {
      done(err);
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

