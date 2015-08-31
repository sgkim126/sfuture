import assert = require('assert');
import should = require('./should');
import Future = require('../src/future');

describe('#sequence', () => {
  it('collects futures and returns a new future of their results.', (done: MochaDone) => {
    let future: Future<any[]> = Future.sequence<any>([
      Future.successful(10),
      Future.successful('hello'),
      Future.successful(20)
    ]);

    should.succeed(future, done, (results: any[]) => {
      assert.equal(results[0], 10);
      assert.equal(results[1], 'hello');
      assert.equal(results[2], 20);
    });
  });

  it('Future.sequence(empty array) returns empty array', (done: MochaDone) => {
    let future: Future<any[]> = Future.sequence([
    ]);

    should.succeed(future, done, (results: any[]) => {
      assert.equal(results.length, 0);
    });
  });

  it('Future.sequence(Future<any[]>) returns Future<any[][]>', (done: MochaDone) => {
    let f1 = Future.successful([1, 2]);
    let f2 = Future.successful([3]);
    let f3 = Future.successful([4, 5, 6]);
    let future: Future<any[]> = Future.sequence([
      f1, f2, f3
    ]);

    should.succeed(future, done, (results: any[]) => {
      assert.deepEqual(results, [ [ 1, 2 ], [ 3 ], [ 4, 5, 6 ] ]);
    });
  });


  it('throws an error when any of futures has failed.', (done: MochaDone) => {
    let future: Future<any[]> = Future.sequence([
      Future.failed(new Error('hello, error!')),
      Future.successful(10),
      Future.successful('hello')
    ]);

    should.fail(future, done, (err) => {
      assert.equal(err.message, 'hello, error!');
    });
  });
});

