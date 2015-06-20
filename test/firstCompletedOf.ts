import Promise = require('mpromise');
import assert = require('assert');
import Future = require('../lib/future');

describe('#firstCompletedOf', () => {
  it('firstCompletedOf returns failed future when firstCompletedOf takes only failed future.', (done: MochaDone) => {
    let f1 = Future.failed(new Error('failed future'));
    let f2 = Future.firstCompletedOf([f1]);
    f2.onFailure((err: Error) => {
      assert.equal(err.message, 'failed future');
      done();
    }).onSuccess((result: any) => {
      done(new Error('must fail'));
    });
  });

  it('firstCompletedOf returns successful future when firstCompletedOf takes only successful future.', (done: MochaDone) => {
    let f1 = Future.successful(1);
    let f2 = Future.firstCompletedOf([f1]);
    f2.nodify(done);
  });

  it('firstCompletedOf returns successful future when the first completed future is successful', (done: MochaDone) => {
    let p1 = new Promise<number, Error>();
    let p2 = new Promise<number, Error>();
    let p3 = new Promise<number, Error>();

    let f1 = new Future(p1);
    let f2 = new Future(p2);
    let f3 = new Future(p3);

    setTimeout(() => { p1.fulfill(1); }, 30);
    setTimeout(() => { p2.reject(new Error('rejected')); }, 20);
    setTimeout(() => { p3.fulfill(3); }, 10);

    let f4 = Future.firstCompletedOf([ f1, f2, f3 ]);
    f4.map((result: number) => {
      assert.equal(result, 3);
    }).nodify(done);
  });

  it('firstCompletedOf returns failed future when the first completed future is failed', (done: MochaDone) => {
    let p1 = new Promise<number, Error>();
    let p2 = new Promise<number, Error>();
    let p3 = new Promise<number, Error>();

    let f1 = new Future(p1);
    let f2 = new Future(p2);
    let f3 = new Future(p3);

    setTimeout(() => { p1.fulfill(1); }, 30);
    setTimeout(() => { p2.fulfill(2); }, 20);
    setTimeout(() => { p3.reject(new Error('rejected')); }, 10);

    let f4 = Future.firstCompletedOf([ f1, f2, f3 ]);
    f4.onFailure((err: Error) => {
      assert.equal(err.message, 'rejected');
      done();
    }).onSuccess((result: any) => {
      done(new Error('must fail'));
    });
  });
});
