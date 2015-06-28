import assert = require('assert');
import Future = require('../lib/future');

describe('#failed', () => {
  it('creates an already completed failed future with the specified result.', (done: MochaDone) => {
    let future = Future.failed(new Error('error'));
    future.onFailure((err: Error) => {
      assert.equal(err.message, 'error');
      done();
    }).onSuccess((result) => {
      done(new Error('Must not reached here.'));
    });
  });
});
