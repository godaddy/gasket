import getopts from 'getopts';

/**
 * Step which runs before oclif any everything else is required.
 * Handles the `--require` flags to allow for early importing of instrumentation
 * modules and the like.
 *
 * @param {string[]} [argv] - CLI arguments - defaults to process.argv
 */
export async function setup(argv = process.argv) {
  // Using to parse args before mounting all of oclif
  const opts = getopts(argv, {
    alias: {
      require: ['r']
    }
  });

  if (opts.require) {
    const required = Array.isArray(opts.require) ? opts.require : [opts.require];
    required.forEach(async (module) => {
      await import(module, { paths: [process.cwd()] })
    });
  }
};
