/* eslint-disable max-statements, no-unused-vars */
import chalk from 'chalk';
import { makeCreateContext } from '../scaffold/create-context.js';
import { dumpErrorContext } from '../scaffold/dump-error-context.js';
import loadTemplate from '../scaffold/actions/load-template.js';
import copyTemplate from '../scaffold/actions/copy-template.js';
import customizeTemplate from '../scaffold/actions/customize-template.js';
import installTemplateDep from '../scaffold/actions/install-template-deps.js';
import mkDir from '../scaffold/actions/mkdir.js';
import printReport from '../scaffold/actions/print-report.js';
import gitInit from '../scaffold/actions/git-init.js';

/**
 * Parses comma separated option input to array
 * @type {import('../internal.js').commasToArray}
 */
const commasToArray = input => input.split(',').map(name => name.trim());

const createCommand = {
  id: 'create',
  description: 'Create a new Gasket application',
  args: [
    {
      name: 'appname',
      description: 'Name of the Gasket application to create',
      required: true
    }
  ],
  options: [
    {
      name: 'template',
      description: `Selects which template you would like to use during
      installation. (e.g. --template @gasket/template-nextjs-pages-js)`
    },
    {
      name: 'template-path',
      description: `(INTERNAL) Path to a local template package. Can be absolute
      or relative to the current working directory.`,
      hidden: true
    },
    {
      name: 'package-manager',
      description: `Selects which package manager you would like to use during
      installation. (e.g. --package-manager pnpm)`
    },
    {
      name: 'require',
      short: 'r',
      description: 'Require module(s) before Gasket is initialized',
      parse: commasToArray
    },
    {
      name: 'npm-link',
      description: `(INTERNAL) Local packages to be linked. Can be set as
      multiple flags (e.g. --npm-link @gasket/plugin-jest)
      comma-separated values: --npm-link=@gasket/plugin-jest,some-test-package`,
      parse: commasToArray,
      hidden: true
    },
    {
      name: 'config',
      description: 'JSON object that provides the values for any interactive prompts'
    },
    {
      name: 'config-file',
      description: 'Path to a JSON file that provides the values for any interactive prompts',
      conflicts: ['config']
    },
    {
      name: 'no-prompts',
      description: '(INTERNAL) Disable to skip the prompts',
      type: 'boolean',
      hidden: true
    }
  ]
};

/**
 * validateOption - We require at least one of the options to be provided
 * @param {import('../internal.js').PartialCreateContext} context - Create context
 * @returns {import('../internal.js').PartialCreateContext} Validated context
 */
function validateOptions(context) {
  const hasOption = (context) => Boolean(context.template || context.templatePath);

  if (!hasOption(context)) {
    console.warn('Warning: At least one of the options is required: --template, --template-path');
    process.exit(1);
  }

  return context;
}

/**
 * handleTemplate - Handles the template creation
 * @param {import('../internal.js').PartialCreateContext} context - Create context
 * @returns {Promise<void>} Promise that resolves when template is created
 */
async function handleTemplate(context) {
  await mkDir({ context });
  await loadTemplate({ context });
  await copyTemplate({ context });
  await customizeTemplate({ context });
  await installTemplateDep({ context });
  await gitInit({ context });
  printReport({ context });
  return;
}

/**
 * createCommand action
 * @type {import('../index.js').createCommandAction}
 */
createCommand.action = async function run(appname, options, command) {
  // eslint-disable-next-line no-process-env
  process.env.GASKET_ENV = 'create';
  const context = makeCreateContext([appname], options);
  validateOptions(context);

  try {
    await handleTemplate(context);
  } catch (err) {
    console.error(chalk.red('Exiting with errors.'));
    dumpErrorContext(context, err);
    throw err;
  }
};

export { createCommand };
