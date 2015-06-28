import assert = require('assert');
import Future = require('../lib/future');

describe('#fromTry', () => {
  it('creates an already completed successful future if error is not given.', (done: MochaDone) => {
    let future = Future.fromTry(null, 'hello');
    future.map((result: string) => {
      assert.equal(result, 'hello');
    }).nodify(done);
  });

  it('creates an already completed failed future if error is given.', (done: MochaDone) => {
    let future = Future.fromTry(new Error('er'), 'hello');
    future.onFailure((err: Error) => {
      try {
        assert.equal(err.message, 'er');
      } catch (ex) {
        done(ex);
      }
      done();
    }).onSuccess(() => {
      done(new Error('must failed'));
    });
  });
});
