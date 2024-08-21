import { jest, expect } from '@jest/globals';

global.jest = jest;
global.expect = expect;
process.env.GASKET_ENV = 'test';

/**
 *
 * @param actual
 * @param branch
 */
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
