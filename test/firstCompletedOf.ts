import assert = require('assert');
import Future = require('../lib/future');

describe('#firstCompletedOf', () => {
  it('firstCompletedOf returns failed future when firstCompletedOf takes only failed future.', (done: MochaDone) => {
    let f1 = Future.failed(new Error('failed future'));
    let f2 = Future.firstCompletedOf([f1]);

    f2.transform(
      (value) => {
        throw new Error('must fail');
      },
      (err) => {
        assert.equal(err.message, 'failed future');
      }
    ).nodify(done);
  });

  it('firstCompletedOf returns successful future when firstCompletedOf takes only successful future.', (done: MochaDone) => {
    let f1 = Future.successful(1);
    let f2 = Future.firstCompletedOf([f1]);
    f2.nodify(done);
  });

  it('firstCompletedOf returns successful future when the first completed future is successful', (done: MochaDone) => {
    let p1 = new Promise<number>((resolve, reject) => {
      setTimeout(() => { resolve(1); }, 30);
    });
    let p2 = new Promise<number>((resolve, reject) => {
      setTimeout(() => { reject(new Error('rejected')); }, 20);
    });
    let p3 = new Promise<number>((resolve, reject) => {
      setTimeout(() => { resolve(3); }, 10);
    });

    let f1 = new Future(p1);
    let f2 = new Future(p2);
    let f3 = new Future(p3);

    let f4 = Future.firstCompletedOf([ f1, f2, f3 ]);
    f4.map((result: number) => {
      assert.equal(result, 3);
    }).nodify(done);
  });

  it('does not change the result even other futures are completed', (done: MochaDone) => {
    let p1 = new Promise<number>((resolve, reject) => {
      setTimeout(() => { resolve(1); }, 30);
    });
    let p2 = new Promise<number>((resolve, reject) => {
      setTimeout(() => { reject(new Error('rejected')); }, 20);
    });
    let p3 = new Promise<number>((resolve, reject) => {
      setTimeout(() => { resolve(3); }, 10);
    });

    let f1 = new Future(p1);
    let f2 = new Future(p2);
    let f3 = new Future(p3);

    let futures = [ f1, f2, f3 ];

    let f4 = Future.firstCompletedOf(futures);

    Future.sequence(futures)
    .onComplete(() => {
      f4.map((result: number) => {
        assert.equal(result, 3);
      }).nodify(done);
    });
  });

  it('firstCompletedOf returns failed future when the first completed future is failed', (done: MochaDone) => {
    let p1 = new Promise<number>((resolve, reject) => {
      setTimeout(() => { resolve(1); }, 30);
    });
    let p2 = new Promise<number>((resolve, reject) => {
      setTimeout(() => { resolve(2); }, 20);
    });
    let p3 = new Promise<number>((resolve, reject) => {
      setTimeout(() => { reject(new Error('rejected')); }, 10);
    });

    let f1 = new Future(p1);
    let f2 = new Future(p2);
    let f3 = new Future(p3);

    let f4 = Future.firstCompletedOf([ f1, f2, f3 ]);
    f4.transform(
      (value) => {
        throw new Error('must fail');
      },
      (err) => {
        assert.equal(err.message, 'rejected');
      }
    ).nodify(done);
  });
});
