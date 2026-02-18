/* eslint-disable max-statements, no-unused-vars */
import chalk from 'chalk';
import { makeCreateContext } from '../scaffold/create-context.js';
import { dumpErrorContext } from '../scaffold/dump-error-context.js';
import { rm } from 'fs/promises';
import { makeGasket } from '@gasket/core';
import globalPrompts from '../scaffold/actions/global-prompts.js';
import loadPreset from '../scaffold/actions/load-preset.js';
import loadTemplate from '../scaffold/actions/load-template.js';
import copyTemplate from '../scaffold/actions/copy-template.js';
import customizeTemplate from '../scaffold/actions/customize-template.js';
import installTemplateDep from '../scaffold/actions/install-template-deps.js';
import presetPromptHooks from '../scaffold/actions/preset-prompt-hooks.js';
import presetConfigHooks from '../scaffold/actions/preset-config-hooks.js';
import promptHooks from '../scaffold/actions/prompt-hooks.js';
import mkDir from '../scaffold/actions/mkdir.js';
import setupPkg from '../scaffold/actions/setup-pkg.js';
import createHooks from '../scaffold/actions/create-hooks.js';
import writePkg from '../scaffold/actions/write-pkg.js';
import generateFiles from '../scaffold/actions/generate-files.js';
import writeGasketConfig from '../scaffold/actions/write-gasket-config.js';
import installModules from '../scaffold/actions/install-modules.js';
import linkModules from '../scaffold/actions/link-modules.js';
import postCreateHooks from '../scaffold/actions/post-create-hooks.js';
import printReport from '../scaffold/actions/print-report.js';
import gitInit from '../scaffold/actions/git-init.js';
import { warnPresetDeprecated } from '../utils/warn-preset-deprecated.js';

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
      name: 'presets',
      short: 'p',
      description: `Initial Gasket preset(s) to use.
      Can be set as short name with version (e.g. --presets nextjs@^1.0.0)
      Or other (multiple) custom presets (e.g. --presets my-gasket-preset@1.0.0.beta-1,nextjs@^1.0.0)`,
      parse: commasToArray
    },
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
  const hasOption = (ctx) =>
    Boolean(ctx.template || ctx.templatePath || ctx.rawPresets?.length || ctx.localPresets?.length);

  if (!hasOption(context)) {
    console.warn(
      'Warning: At least one option is required: --template (preferred), --template-path, ' +
        '--presets (deprecated), or --preset-path (deprecated).'
    );
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
 * handlePresets - Handles the preset creation
 * @param {import('../internal.js').PartialCreateContext} context - Create context
 * @returns {Promise<void>} Promise that resolves when presets are applied
 */
async function handlePresets(context) {
  await loadPreset({ context });
  await globalPrompts({ context });

  const presetGasket = makeGasket({
    plugins: context.presets
  });

  await presetPromptHooks({ gasket: presetGasket, context });
  await presetConfigHooks({ gasket: presetGasket, context });

  const pluginGasket = makeGasket({
    ...context.presetConfig,
    plugins: context.presetConfig.plugins.concat(context.presets)
  });

  await promptHooks({ gasket: pluginGasket, context });
  await mkDir({ context });
  await setupPkg({ context });
  await createHooks({ gasket: pluginGasket, context });
  await writePkg({ context });
  await generateFiles({ context });
  await writeGasketConfig({ context });
  await installModules({ context });
  await linkModules({ context });
  await postCreateHooks({ gasket: pluginGasket, context });
  if (context.tmpDir) await rm(context.tmpDir, { recursive: true });
  printReport({ context });
}

/**
 * handleCreate - Handles the create creation
 * @param {import('../internal.js').PartialCreateContext} context - Create context
 * @returns {Promise<void>} Promise that resolves when app is created
 */
async function handleCreate(context) {
  const { template, templatePath } = context;
  if (template || templatePath) {
    await handleTemplate(context);
  } else {
    await handlePresets(context);
  }
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
  warnPresetDeprecated(context);

  try {
    await handleCreate(context);
  } catch (err) {
    console.error(chalk.red('Exiting with errors.'));
    dumpErrorContext(context, err);
    throw err;
  }
};

export { createCommand };
