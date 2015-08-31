import assert = require('assert');
import should = require('./should');
import Future = require('../src/future');

describe('#fromTry', () => {
  it('creates an already completed successful future if error is not given.', (done: MochaDone) => {
    let future = Future.fromTry(null, 'hello');

    should.succeed(future, done, (result: string) => {
      assert.equal(result, 'hello');
    });
  });

  it('creates an already completed failed future if error is given.', (done: MochaDone) => {
    let future = Future.fromTry(new Error('er'), 'hello');

    should.fail(future, done, (err) => {
      assert.equal(err.message, 'er');
    });
  });
});
