import assert = require('assert');
import Future = require('../lib/future');

describe('#onSuccess', () => {
  it('registers a success callback.', (done: MochaDone) => {
    let future = Future.successful(10);
    future.onSuccess((result) => {
      try {
        assert.equal(result, 10);
        done();
      } catch (ex) {
        done(ex);
      }
    }).onFailure((err: Error) => {
      done(new Error('Must not reached here.'));
    });
  });
});
