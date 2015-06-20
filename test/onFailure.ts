import assert = require('assert');
import Future = require('../lib/future');

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
