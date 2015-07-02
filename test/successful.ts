import assert = require('assert');
import Future = require('../lib/future');

describe('#successful', () => {
  it('creates an already completed successful future with the specified result.', (done: MochaDone) => {
    let future = Future.successful('hello');
    future.map((result: string) => {
      assert.equal(result, 'hello');
    }).nodify(done);
  });
});
