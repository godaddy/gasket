
// eslint-disable-next-line no-process-env
process.env.GASKET_ENV = 'test';

/**
 * Expectation to check if a trace proxy is in the same branch as another.
 * @param {object} actual - The actual trace proxy object to check.
 * @param {object} branch - The branch trace proxy to compare against.
 * @returns {object} An object with a pass boolean and a message function.
 */
function traceProxyOf(actual, branch) {
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
  traceProxyOf
});
