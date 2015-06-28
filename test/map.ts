import assert = require('assert');
import Future = require('../lib/future');

describe('#map', () => {
  it('maps the result of a Future into another result.', (done: MochaDone) => {
    let future = Future.successful(10);
    let mapedFuture = future.map((result: number) => {
      return result + ' times!';
    });
    mapedFuture.onSuccess((result: string) => {
      assert.equal(result, '10 times!');
      done();
    }).onFailure((err: Error) => {
      done(new Error('Must not reached here.'));
    });
  });

  it('throws error when the original future throws error.', (done: MochaDone) => {
    let future = Future.failed(new Error('hello, error!'));
    let mapedFuture = future.map((result: number) => {
      return result + ' times!';
    });
    mapedFuture.onFailure((err) => {
      assert.equal(err.message, 'hello, error!');
      done();
    }).onSuccess((result) => {
      done(new Error('Must not reached here.'));
    });
  });
});
