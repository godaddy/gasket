import { jest, expect } from '@jest/globals';

global.jest = jest;
global.expect = expect;
// eslint-disable-next-line no-process-env
process.env.GASKET_ENV = 'test';

function isolateOf(actual, branch) {
  if (
    actual !== branch &&
    actual.constructor === branch.constructor &&
    actual.branchId === branch.branchId
  ) {
    return {
      message: () =>
        `expected ${this.utils.printReceived(
          actual
        )} to NOT be in same branch ${this.utils.printExpected(branch.branchId)}`,
      pass: true
    };
  }

  return {
    message: () =>
      `expected ${this.utils.printReceived(
        actual
      )} to be in same branch ${this.utils.printExpected(branch.branchId)}`,
    pass: false
  };
}

expect.extend({
  isolateOf
});
