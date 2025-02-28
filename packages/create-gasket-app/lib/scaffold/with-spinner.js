import ora from 'ora';

/**
 * Base function to handle spinner logic
 * @type {import('../internal').wrapWithSpinner}
 */
function wrapWithSpinner(label, task, { startSpinner = true } = {}) {
  /** @type {import('../internal').execute} */
  async function execute(context) {
    const spinner = ora(label);
    if (startSpinner) spinner.start();

    try {
      await task({ ...context, spinner });
      if (spinner.isSpinning) spinner.succeed();
    } catch (error) {
      spinner.fail();
      context.errors = context.errors || [];
      context.errors.push(error.stack);
      throw error;
    }
  }

  execute.wrapped = task;
  return execute;
}

/**
 * Wrap a task with a spinner, including gasket and context.
 * @type {import('../internal').withGasketSpinner}
 */
export function withGasketSpinner(label, task, options) {
  return wrapWithSpinner(label, ({ gasket, context, spinner }) =>
    task({ gasket, context, spinner }),
  options
  );
}

/**
 * Wrap a task with a spinner, using only context.
 * @type {import('../internal').withSpinner}
 */
export function withSpinner(label, task, options) {
  return wrapWithSpinner(label, ({ context, spinner }) =>
    task({ context, spinner }),
  options
  );
}
