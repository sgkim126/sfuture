import assert = require('assert');
import Future = require('../lib/future');

describe('#foreach', () => {
  it('foreach calls when successful.', (done: MochaDone) => {
    let future = Future.successful(10);
    future.onFailure((err: Error) => {
      done(new Error('Must not reached here.'));
    }).foreach((result: number) => {
      assert.equal(result, 10);
      done();
    });
  });
});
