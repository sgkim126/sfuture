import assert = require('assert');
import Future = require('../lib/future');

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
