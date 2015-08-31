import assert = require('assert');
import should = require('./should');
import Future = require('../src/future');

describe('#successful', () => {
  it('creates an already completed successful future with the specified result.', (done: MochaDone) => {
    let future = Future.successful('hello');

    should.succeed(future, done, (result: string) => {
      assert.equal(result, 'hello');
    });
  });
});
