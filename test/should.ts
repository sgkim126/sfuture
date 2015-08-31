import assert = require('assert');
import util = require('util');
import Future = require('../src/future');

function defaultSucceed<T>(value?: T) {
  return;
}

function defaultFail(err?: any) {
  assert(err);
}

export function succeed<T>(future: Future<T>, done: MochaDone, checker: (value?: T) => any = defaultSucceed) {
  future.map(checker).nodify(done);
}

export function fail<T>(future: Future<T>, done: MochaDone, checker: (err?: any) => any = defaultFail) {
  future.transform(
    (value: T) => {
      throw new Error(util.format('should fail, but %j', value));
    },
    checker
  ).nodify(done);
}
