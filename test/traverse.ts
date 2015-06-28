import assert = require('assert');
import Future = require('../lib/future');

describe('#traverse', () => {
  it('returns successful future on empty array', (done: MochaDone) => {
    Future.traverse<string, number>([], (arg: string): Future<number> => { return Future.successful(arg.length); })
    .map((results: number[]) => {
      assert.equal(results.length, 0);
    }).nodify(done);
  });

  it('returns successful future', (done: MochaDone) => {
    let args = [ "a", "bcd", "e fg", "hij" ];
    Future.traverse<string, number>(
      args,
      (arg: string): Future<number> => { return Future.successful(arg.length); }
    ).map((results: number[]) => {
      let length = results.length;
      assert.equal(length, 4);
      for (let i = 0; i < length; i += 1) {
        assert.equal(results[i], args[i].length, i + '-th result not matched');
      }
    }).nodify(done);
  });

  it('returns failed future if one of it failed', (done: MochaDone) => {
    let args = [ "a", "bcd", "e fg", "hij" ];
    Future.traverse<string, number>(
      args,
      (arg: string): Future<number> => {
        if (arg === args[2]) {
          return Future.failed(new Error(arg));
        } else {
          return Future.successful(arg.length);
        }
      }
    ).onSuccess((args: number[]) => {
      done(new Error('must failed'));
    }).onFailure((err: Error) => {
      try {
        assert.equal(err.message, args[2]);
        done();
      } catch (ex) {
        done(ex);
      }
    });
  });

  it('throws exception when function throw exception', () => {
    let args = [ "a", "bcd", "e fg", "hij" ];
    assert.throws(() => {
      Future.traverse<string, number>(
        args,
        (arg: string): Future<number> => {
          if (arg === args[2]) {
            throw new Error(arg);
          } else {
            return Future.successful(arg.length);
          }
        }
      );
    });
  });

  it('executes all function even one of it failed', (done: MochaDone) => {
    let args = [ "a", "bcd", "e fg", "hij" ];
    let count = 0;
    Future.traverse<string, number>(
      args,
      (arg: string): Future<number> => {
        count += 1;
        if (arg === args[2]) {
          return Future.failed(new Error(arg));
        } else {
          return Future.successful(arg.length);
        }
      }
    ).onSuccess((args: number[]) => {
      done(new Error('must failed'));
    }).onFailure((err: Error) => {
      try {
        assert.equal(err.message, args[2]);
        assert.equal(count, args.length);
        done();
      } catch (ex) {
        done(ex);
      }
    });
  });

  it('executes stop executing function when it throws error', () => {
    let count = 0;
    let args = [ "a", "bcd", "e fg", "hij" ];
    assert.throws(() => {
      Future.traverse<string, number>(
        args,
        (arg: string): Future<number> => {
          count += 1;
          if (arg === args[1]) {
            throw new Error(arg);
          } else {
            return Future.successful(arg.length);
          }
        }
      );
    });

    assert.equal(count, 2);
  });
});
