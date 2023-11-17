/* eslint-disable max-statements */
import { Command, Flags } from '@oclif/core';
import ora from 'ora';
import chalk from 'chalk';

import makeCreateContext from '../scaffold/create-context.js';

import {
  mkDir,
  loadPreset,
  cliVersion,
  globalPrompts,
  setupPkg,
  writePkg,
  writePkgUpdate,
  installModules,
  installModulesUpdate,
  linkModules,
  linkModulesUpdate,
  loadPkgForDebug,
  promptHooks,
  createHooks,
  postCreateHooks,
  generateFiles,
  writeGasketConfig,
  applyPresetConfig,
  printReport
} from '../scaffold/actions/index.js';

import { dumpErrorContext } from '../scaffold/dump-error-context.js';

/**
 * Parses comma separated flag input to array
 *
 * @param {String} input - Flag argument
 * @returns {String[]} results
 */
const commasToArray = input => input.split(',').map(name => name.trim());

export class CreateCommand extends Command {
  static description = `Create a new Gasket application`;
  static flags = {
    'presets': Flags.string({
      env: 'GASKET_PRESETS',
      char: 'p',
      multiple: true,
      parse: commasToArray,
      description: `Initial Gasket preset(s) to use.
  Can be set as short name with version (e.g. --presets nextjs@^1.0.0)
  Or other (multiple) custom presets (e.g. --presets my-gasket-preset@1.0.0.beta-1,nextjs@^1.0.0)`
    }),
    'plugins': Flags.string({
      env: 'GASKET_PLUGINS',
      description: `Additional plugin(s) to install. Can be set as
  multiple flags (e.g. --plugins jest --plugins zkconfig@^1.0.0)
  comma-separated values: --plugins=jest,zkconfig^1.0.0
      `,
      multiple: true,
      parse: commasToArray
    }),
    'package-manager': Flags.string({
      description: `Selects which package manager you would like to use during
   installation. (e.g. --package-manager yarn)`
    }),
    'require': Flags.string({
      description: 'Require module(s) before Gasket is initialized',
      char: 'r',
      multiple: true
    }),
    'bootstrap': Flags.boolean({
      default: true,
      description: '(INTERNAL) If provided, skip the bootstrap phase',
      allowNo: true,
      hidden: true
    }),
    'generate': Flags.boolean({
      default: true,
      description: '(INTERNAL) If provided, skip the generate phase',
      allowNo: true,
      hidden: true
    }),
    'npm-link': Flags.string({
      description: `(INTERNAL) Local packages to be linked. Can be set as
  multiple flags (e.g. --npm-link @gasket/plugin-jest --npm-link some-test-preset)
  comma-separated values: --npm-link=@gasket/plugin-jest,some-test-preset`,
      multiple: true,
      hidden: true,
      parse: commasToArray
    }),
    'preset-path': Flags.string({
      description: `(INTERNAL) Paths the a local preset packages. Can be absolute
  or relative to the current working directory.
  comma-separated values: --preset-path=path1,path2`,
      multiple: true,
      hidden: true,
      parse: commasToArray
    }),
    // TODO (kinetifex): remove in next major revision
    'npmconfig': Flags.string({
      env: 'GASKET_NPM_USERCONFIG',
      description: `(DEPRECATED) .npmrc to be used for npm actions in @gasket/cli'.
  Instead, prefer environment variables to configure package managers
  `,
      hidden: true
    }),
    'config': Flags.string({
      env: 'GASKET_PLUGINS',
      description: `JSON object that provides the values for any interactive prompts`,
      exclusive: ['config-file']
    }),
    'config-file': Flags.string({
      description: `Path to a JSON file that provides the values for interactive prompts`,
      exclusive: ['config']
    }),
    'prompts': Flags.boolean({
      default: true,
      description: '(INTERNAL) Disable to skip the prompts',
      allowNo: true,
      hidden: true
    })
  };

  static args = {
    appname: Flags.string({
      name: 'appname',
      required: true,
      description: 'Name of the Gasket application to create'
    })
  };



  /**
   *  Gasket create executes a two phase creation process:
   *
   *  ## Bootstrap
   *    Creates the initial app directory and package.json
   *    based on the preset and global prompts.
   *
   *  ## Generate
   *    Executes prompt and create hooks from plugins,
   *    then creates the additional files.
   *
   *    If bootstrap phase is skipped, it will try to use
   *    an existing directory and package.json for the app.
   */
  async run() {
    const { argv, flags: parsedFlags } = await this.parse(CreateCommand);
    const { bootstrap, generate } = parsedFlags;

    let context;
    try {
      context = makeCreateContext(argv, parsedFlags);
    } catch (error) {
      console.error(chalk.red(error) + '\n');
      console.log(this._help());
      this.exit();
    }

    try {
      if (bootstrap !== false) {
        await loadPreset(context);
        await cliVersion(context);
        await applyPresetConfig(context);
        await globalPrompts(context);
        await mkDir(context);
        await setupPkg(context);
        await writePkg(context);
        await installModules(context);
        await linkModules(context);
      } else {
        ora('Bootstrap phase skipped.').warn();
        if (generate !== false) {
          await loadPkgForDebug(context);
        }
      }

      if (generate !== false) {
        await promptHooks(context);
        await createHooks(context);
        await generateFiles(context);
        await writeGasketConfig(context);
        await writePkgUpdate(context);
        await installModulesUpdate(context);
        await linkModulesUpdate(context); // relink any that were messed up by re-install
        await postCreateHooks(context);
      } else {
        ora('Generate phase skipped.').warn();
      }

      await printReport(context);

    } catch (err) {
      console.error(chalk.red('Exiting with errors.'));
      dumpErrorContext(context, err);
      throw err;
    }
  }
}

// /**
//  * Parses comma separated flag input to array
//  *
//  * @param {String} input - Flag argument
//  * @returns {String[]} results
//  */
// const commasToArray = input => input.split(',').map(name => name.trim());

// CreateCommand.description = `Create a new Gasket application`;
// CreateCommand.flags = {
//   'presets': Flags.string({
//     env: 'GASKET_PRESETS',
//     char: 'p',
//     multiple: true,
//     parse: commasToArray,
//     description: `Initial Gasket preset(s) to use.
// Can be set as short name with version (e.g. --presets nextjs@^1.0.0)
// Or other (multiple) custom presets (e.g. --presets my-gasket-preset@1.0.0.beta-1,nextjs@^1.0.0)`
//   }),
//   'plugins': Flags.string({
//     env: 'GASKET_PLUGINS',
//     description: `Additional plugin(s) to install. Can be set as
// multiple flags (e.g. --plugins jest --plugins zkconfig@^1.0.0)
// comma-separated values: --plugins=jest,zkconfig^1.0.0
//     `,
//     multiple: true,
//     parse: commasToArray
//   }),
//   'package-manager': Flags.string({
//     description: `Selects which package manager you would like to use during
//  installation. (e.g. --package-manager yarn)`
//   }),
//   'require': Flags.string({
//     description: 'Require module(s) before Gasket is initialized',
//     char: 'r',
//     multiple: true
//   }),
//   'bootstrap': Flags.boolean({
//     default: true,
//     description: '(INTERNAL) If provided, skip the bootstrap phase',
//     allowNo: true,
//     hidden: true
//   }),
//   'generate': Flags.boolean({
//     default: true,
//     description: '(INTERNAL) If provided, skip the generate phase',
//     allowNo: true,
//     hidden: true
//   }),
//   'npm-link': Flags.string({
//     description: `(INTERNAL) Local packages to be linked. Can be set as
// multiple flags (e.g. --npm-link @gasket/plugin-jest --npm-link some-test-preset)
// comma-separated values: --npm-link=@gasket/plugin-jest,some-test-preset`,
//     multiple: true,
//     hidden: true,
//     parse: commasToArray
//   }),
//   'preset-path': Flags.string({
//     description: `(INTERNAL) Paths the a local preset packages. Can be absolute
// or relative to the current working directory.
// comma-separated values: --preset-path=path1,path2`,
//     multiple: true,
//     hidden: true,
//     parse: commasToArray
//   }),
//   // TODO (kinetifex): remove in next major revision
//   'npmconfig': Flags.string({
//     env: 'GASKET_NPM_USERCONFIG',
//     description: `(DEPRECATED) .npmrc to be used for npm actions in @gasket/cli'.
// Instead, prefer environment variables to configure package managers
// `,
//     hidden: true
//   }),
//   'config': Flags.string({
//     env: 'GASKET_PLUGINS',
//     description: `JSON object that provides the values for any interactive prompts`,
//     exclusive: ['config-file']
//   }),
//   'config-file': Flags.string({
//     description: `Path to a JSON file that provides the values for interactive prompts`,
//     exclusive: ['config']
//   }),
//   'prompts': Flags.boolean({
//     default: true,
//     description: '(INTERNAL) Disable to skip the prompts',
//     allowNo: true,
//     hidden: true
//   })
// };

// CreateCommand.args = [
//   {
//     name: 'appname',
//     required: true,
//     description: 'Name of the Gasket application to create'
//   }
// ];
