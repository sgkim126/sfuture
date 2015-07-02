import assert = require('assert');
import Future = require('../lib/future');

describe('#flatMap', () => {
  it('maps the result of a Future into another futured result.', (done: MochaDone) => {
    let future = Future.successful(10);
    let flatMappedFuture = future.flatMap((result: number) => {
      let future = Future.successful(result + ' times!');
      return future;
    });
    flatMappedFuture.map((result: string) => {
      assert.equal(result, '10 times!');
    }).nodify(done);
  });

  it('throws error when the original future throws error.', (done: MochaDone) => {
    let future = Future.failed(new Error('hello, error!'));
    let flatMappedFuture = future.flatMap((result: number) => {
      let future = Future.successful(result + ' times!');
      return future;
    });

    flatMappedFuture.transform(
      (value) => {
        throw new Error('Must not reached here.');
      },
      (err) => {
        assert.equal(err.message, 'hello, error!');
      }
    ).nodify(done);
  });

  it('throws error when a mapped future throws error.', (done: MochaDone) => {
    let future = Future.successful(10);
    let flatMappedFuture = future.flatMap((result: number): Future<number> => {
      throw new Error('hello, error!');
    });
    flatMappedFuture.transform(
      (value) => {
        throw new Error('Must not reached here.');
      },
      (err) => {
        assert.equal(err.message, 'hello, error!');
      }
    ).nodify(done);
  });

  it('return failed future if callback returns failed future.', (done: MochaDone) => {
    let future = Future.successful(10);
    let flatMappedFuture = future.flatMap((result: number): Future<number> => {
      return Future.failed(new Error('hello, error!'));
    });
    flatMappedFuture.transform(
      (value) => {
        throw new Error('Must not reached here.');
      },
      (err) => {
        assert.equal(err.message, 'hello, error!');
      }
    ).nodify(done);
  });
});
