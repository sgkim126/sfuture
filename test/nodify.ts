import assert = require('assert');
import Future = require('../src/future');

describe('#nodify', () => {
  it('successful future calls callback with result', (done: MochaDone) => {
    Future.successful(100).nodify((err: Error, result: number) => {
      try {
        assert.ifError(err);
        assert.equal(result, 100);
        done();
      } catch (ex) {
        done(ex);
      }
    });
  });

  it('failed future calls callback with error', (done: MochaDone) => {
    Future.failed(new Error('error')).nodify((err: Error, result: number) => {
      try {
        assert.equal(err.message, 'error');
        assert.strictEqual(result, undefined);
        done();
      } catch (ex) {
        done(ex);
      }
    });
  });
});

