import ora from 'ora';

/** @type {import('../internal.d.ts').wrapWithSpinner} */
function wrapWithSpinner(label, task, { startSpinner = true } = {}) {
  /** @type {import('../internal.d.ts').execute} */
  async function execute(args) {
    const { context } = args;
    const spinner = ora(label);
    if (startSpinner) spinner.start();

    try {
      await task({ ...args, spinner });
      if (spinner.isSpinning) spinner.succeed();
    } catch (error) {
      spinner.fail();
      context.errors = context.errors || [];
      context.errors.push(error.stack ?? String(error));
      throw error;
    }
  }

  execute.wrapped = task;
  return execute;
}

/** @type {import('../internal.d.ts').withGasketSpinner} */
export function withGasketSpinner(label, task, options) {
  return wrapWithSpinner(label, ({ gasket, context, spinner }) =>
    task({ gasket, context, spinner }),
  options
  );
}

/** @type {import('../internal.d.ts').withSpinner} */
export function withSpinner(label, task, options) {
  return wrapWithSpinner(label, ({ context, spinner }) =>
    task({ context, spinner }),
  options
  );
}
