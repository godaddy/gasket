const ora = require('ora');

/**
 * Decorate a create action with spinner.
 * If an action throws, a fail spinner will render for the step, regardless of
 * if the spinner was started or not.
 * @param {string} label - Label for the spinner
 * @param {Function} fn - Action to wrap
 * @param {boolean} startSpinner - Should the spinner start
 * @returns {Function} decorated action
 */
module.exports = function withSpinner(label, fn, { startSpinner = true } = {}) {
  /**
   * Decorated function
   * @param {import("@gasket/cli").CreateContext} context - Create context
   * @returns {Promise} promise
   */
  async function wrapper(context) {
    const spinner = ora(label);
    if (startSpinner) spinner.start();
    try {
      await fn(context, spinner);
      if (spinner.isSpinning) spinner.succeed();
    } catch (err) {
      spinner.fail();
      context.errors.push(err.stack);
      throw err;
    }
  }

  wrapper.wrapped = fn;
  return wrapper;
};
