import assert = require('assert');
import Future = require('../lib/future');

describe('#failed', () => {
  it('creates an already completed failed future with the specified result.', (done: MochaDone) => {
    let future = Future.failed(new Error('error'));

    future.transform(
      (value) => {
        throw new Error('Must not reached here.');
      },
      (err) => {
        assert.equal(err.message, 'error');
      }
    ).nodify(done);
  });
});
