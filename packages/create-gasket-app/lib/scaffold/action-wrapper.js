import ora from 'ora';

/**
 * Decorate a create action with spinner.
 * If an action throws, a fail spinner will render for the step, regardless of
 * if the spinner was started or not.
 * @type {import('../internal').withSpinner}
 */
export default function withSpinner(label, fn, { startSpinner = true } = {}) {
  /**
   * Decorated function
   * @type {import('../internal').withSpinnerWrapper}
   */
  async function wrapper({ gasket = {}, context }) {
    const spinner = ora(label);
    if (startSpinner) spinner.start();
    try {
      await fn({ gasket, context, spinner });
      if (spinner.isSpinning) spinner.succeed();
    } catch (err) {
      spinner.fail();
      context.errors.push(err.stack);
      throw err;
    }
  }

  wrapper.wrapped = fn;
  return wrapper;
}
