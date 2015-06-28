import assert = require('assert');
import Future = require('../lib/future');

describe('#onFailure', () => {
  it('registers a failure callback.', (done: MochaDone) => {
    let future = Future.failed(new Error('hello, error!'));
    future.onFailure((err) => {
      assert.equal(err.message, 'hello, error!');
      done();
    }).onSuccess((result) => {
      done(new Error('Must not reached here.'));
    });
  });
});
