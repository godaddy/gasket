/* eslint-disable max-statements */
const { Command } = require('commander');
const ora = require('ora');
const chalk = require('chalk');
const makeCreateContext = require('../scaffold/create-context');
const dumpErrorContext = require('../scaffold/dump-error-context');
const {
  mkDir,
  loadPreset,
  cliVersion,
  globalPrompts,
  setupPkg,
  writePkg,
  installModules,
  linkModules,
  loadPkgForDebug,
  promptHooks,
  createHooks,
  postCreateHooks,
  generateFiles,
  writeGasketConfig,
  applyPresetConfig,
  printReport
} = require('../scaffold/actions');

async function bootstrap(context) {
  await loadPreset(context);
  cliVersion(context);
  applyPresetConfig(context);
  await globalPrompts(context);
  await mkDir(context);
  await setupPkg(context);
  await writePkg(context);
  await installModules(context);
  await linkModules(context);
}

async function generate(context) {
  await promptHooks(context);
  await createHooks(context);
  await generateFiles(context);
  await writeGasketConfig(context);
  await writePkg.update(context);
  await installModules.update(context);
  await linkModules.update(context); // relink any that were messed up by re-install
  await postCreateHooks(context);
}

async function run(appname, options, command) {
  const argv = [appname];
  const parsedFlags = options;
  const { NoBootstrap, NoGenerate } = parsedFlags;

  let context;
  try {
    context = makeCreateContext(argv, parsedFlags);
  } catch (error) {
    console.error(chalk.red(error) + '\n');
    command.help();
  }

  try {
    if (!NoBootstrap) {
      await bootstrap(context);
    } else {
      ora('Bootstrap phase skipped.').warn();
      if (!NoGenerate) {
        await loadPkgForDebug(context);
      }
    }

    if (!NoGenerate) {
      await generate(context);
    } else {
      ora('Generate phase skipped.').warn();
    }

    printReport(context);

  } catch (err) {
    console.error(chalk.red('Exiting with errors.'));
    dumpErrorContext(context, err);
    throw err;
  }
}

/**
 * Parses comma separated flag input to array
 *
 * @param {String} input - Flag argument
 * @returns {String[]} results
 */
const commasToArray = input => input.split(',').map(name => name.trim());

module.exports = {
  id: 'create',
  description: 'Create a new Gasket application',
  args: [
    {
      name: 'appname',
      description: 'Name of the Gasket application to create',
      required: true
    }
  ],
  action: run,
  options: [
    {
      name: 'presets',
      short: 'p',
      description: `Initial Gasket preset(s) to use.
      Can be set as short name with version (e.g. --presets nextjs@^1.0.0)
      Or other (multiple) custom presets (e.g. --presets my-gasket-preset@1.0.0.beta-1,nextjs@^1.0.0)`,
      parse: commasToArray
    },
    {
      name: 'plugins',
      description: `Additional plugin(s) to install. Can be set as
      multiple flags (e.g. --plugins jest --plugins zkconfig@^1.0.0)
      comma-separated values: --plugins=jest,zkconfig^1.0.0`,
      parse: commasToArray
    },
    {
      name: 'package-manager',
      description: `Selects which package manager you would like to use during
      installation. (e.g. --package-manager yarn)`
    },
    {
      name: 'require',
      short: 'r',
      description: 'Require module(s) before Gasket is initialized',
      parse: commasToArray
    },
    {
      name: 'no-bootstrap',
      description: '(INTERNAL) If provided, skip the bootstrap phase',
      default: false,
      type: 'boolean',
      parse: (bool) => bool === 'false' ? false : true
    },
    {
      name: 'no-generate',
      description: '(INTERNAL) If provided, skip the generate phase',
      default: false,
      type: 'boolean',
      parse: (bool) => bool === 'false' ? false : true
    },
    {
      name: 'npm-link',
      description: `(INTERNAL) Local packages to be linked. Can be set as
      multiple flags (e.g. --npm-link @gasket/plugin-jest --npm-link some-test-preset)
      comma-separated values: --npm-link=@gasket/plugin-jest,some-test-preset`,
      parse: commasToArray,
      hidden: true
    },
    {
      name: 'preset-path',
      description: `(INTERNAL) Paths the a local preset packages. Can be absolute
      or relative to the current working directory.
      comma-separated values: --preset-path=path1,path2`,
      parse: commasToArray,
      hidden: true
    },
    {
      name: 'npmconfig',
      description: `(DEPRECATED) .npmrc to be used for npm actions in @gasket/cli'.
      Instead, prefer environment variables to configure package managers
      `,
      hidden: true
    },
    {
      name: 'config',
      description: 'JSON object that provides the values for any interactive prompts'
    },
    {
      name: 'config-file',
      description: 'Path to a JSON file that provides the values for any interactive prompts'
    },
    {
      name: 'prompts',
      description: '(INTERNAL) Disable to skip the prompts',
      default: true,
      hidden: true
    }
  ]
}
