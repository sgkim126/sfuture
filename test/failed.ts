import assert = require('assert');
import should = require('./should');
import Future = require('../lib/future');

describe('#failed', () => {
  it('creates an already completed failed future with the specified result.', (done: MochaDone) => {
    let future = Future.failed(new Error('error'));

    should.fail(future, done, (err) => {
      assert.equal(err.message, 'error');
    });
  });
});
