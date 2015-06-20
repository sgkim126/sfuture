import assert = require('assert');
import Future = require('../lib/future');

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
