/* eslint-disable max-statements */
import chalk from 'chalk';
import { makeCreateContext } from '../scaffold/create-context.js';
import { dumpErrorContext } from '../scaffold/dump-error-context.js';
import { rm } from 'fs/promises';
import { makeGasket } from '@gasket/core';
import { defaultPlugins } from '../config/default-plugins.js';
import {
  createHooks,
  generateFiles,
  globalPrompts,
  installModules,
  linkModules,
  loadPreset,
  mkDir,
  postCreateHooks,
  printReport,
  presetPromptHooks,
  presetConfigHooks,
  promptHooks,
  setupPkg,
  writeGasketConfig,
  writePkg
} from '../scaffold/actions/index.js';

/**
 * Parses comma separated option input to array
 *
 * @param {String} input - option argument
 * @returns {String[]} results
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
      name: 'prompts',
      description: '(INTERNAL) Disable to skip the prompts',
      default: true,
      type: 'boolean',
      hidden: true
    }
  ]
};

createCommand.action = async function run(appname, options, command) {
  const context = makeCreateContext([appname], options);
  const { rawPresets, localPresets } = context;

  try {
    await globalPrompts(null, context);

    if (rawPresets.length || localPresets.length) {
      await loadPreset(null, context);

      const presetGasket = makeGasket({
        plugins: context.presets
      });

      await presetPromptHooks(presetGasket, context);
      await presetConfigHooks(presetGasket, context);
    }

    const pluginGasket = makeGasket({
      ...context.presetConfig,
      plugins: context.presets.concat(context.presetConfig.plugins, defaultPlugins)
    });

    await promptHooks(pluginGasket, context);
    await mkDir(null, context);
    await setupPkg(null, context);
    await createHooks(pluginGasket, context);
    await writePkg(null, context);
    await generateFiles(null, context);
    await writeGasketConfig(null, context);
    await installModules(null, context);
    await linkModules(null, context);
    await postCreateHooks(pluginGasket, context);
    if (context.tmpDir) await rm(context.tmpDir, { recursive: true });
    printReport(context);
  } catch (err) {
    console.error(chalk.red('Exiting with errors.'));
    dumpErrorContext(context, err);
    throw err;
  }
}

export { createCommand };
