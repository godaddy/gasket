/* eslint-disable max-statements */
import ora from 'ora';
import chalk from 'chalk';
import { makeCreateContext } from '../scaffold/create-context.js';
import { dumpErrorContext } from '../scaffold/dump-error-context.js';
import {
  applyPresetConfig,
  cliVersion,
  createHooks,
  generateFiles,
  globalPrompts,
  installModules,
  linkModules,
  loadPkgForDebug,
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
import path from 'path';
import os from 'os';
import { mkdtemp, rm } from 'fs/promises';
import { default as gasketUtils } from '@gasket/utils';
import { makeGasket } from '@gasket/core';
import { defaultPlugins } from '../config/default-plugins.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

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
      type: 'boolean',
      hidden: true
    },
    {
      name: 'no-generate',
      description: '(INTERNAL) If provided, skip the generate phase',
      type: 'boolean',
      hidden: true
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

async function wait(ms = 50) {
  return new Promise(resolve => {
    console.log('waiting...')
    setTimeout(resolve, ms);
  });
}

function evaluatePreset(preset) {
  const parts = preset.split('@').filter(Boolean);
  if (parts.length > 1) {
    return {
      name: `@${parts[0]}`,
      version: parts[1]
    };
  } else if (parts.length === 1) {
    return {
      name: `@${parts[0]}`,
      version: 'latest'
    };
  }

  return preset;
}

createCommand.action = async function run(appname, options, command) {
  // temp
  process.env.GASKET_DEBUG_NPM = 'true';
  // temp
  const context = makeCreateContext([appname], options);
  const {
    presets = [],
    presetPath = [],
  } = options;

  const tmpDir = await mkdtemp(path.join(os.tmpdir(), `gasket-create-${context.appName}`));
  const modPath = path.join(tmpDir, 'node_modules');
  console.log(tmpDir);
  await globalPrompts(null, context);

  const pkgManager = new gasketUtils.PackageManager({ packageManager: context.packageManager, dest: tmpDir });
  const pkgVerb = pkgManager.isYarn ? 'add' : 'install';

  const remotePresets = await Promise.all(presets.map(async preset => {
    const { name: presetName, version: presetVersion } = evaluatePreset(preset);
    await pkgManager.exec(pkgVerb, [`${presetName}@${presetVersion}`]);
    const pkgFile = require(path.join(modPath, presetName, 'package.json'));
    const presetMod = await import(pkgFile.name, { from: modPath });

    // const dependencies = Object.entries(pkgFile.dependencies || {})
    //   .filter(([name]) => name.startsWith('@gasket'))
    //   .map(([name, version]) => ({ name, version }));

    // const plugins = await Promise.all(dependencies.map(async ({ name }) => {
    //   const mod = await import(name, { from: modPath });
    //   return mod.default || mod;
    // }));

    return {
      module: presetMod.default || presetMod,
      pkgFile,
      // dependencies,
      // plugins
    }
  }));

  const localPresets = await Promise.all(presetPath.map(async localPreset => {
    await pkgManager.exec(pkgVerb, [localPreset]);
    const pkgFile = require(path.join(localPreset, 'package.json'));
    const presetMod = await import(pkgFile.name, { from: modPath });

    // const dependencies = Object.entries(pkgFile.dependencies || {})
    //   .filter(([name]) => name.startsWith('@gasket'))
    //   .map(([name, version]) => ({ name, version }));

    // const plugins = await Promise.all(dependencies.map(async ({ name }) => {
    //   const mod = await import(name, { from: modPath });
    //   return mod.default || mod;
    // }));

    return {
      module: presetMod.default || presetMod,
      pkgFile,
      // dependencies,
      // plugins
    };
  }));


  const configuredPresets = [
    ...remotePresets,
    ...localPresets
  ];
  // console.log(configuredPresets);
  // throw new Error('stop');
  const presetPlugins = configuredPresets.reduce((acc, p) => {
    return [
      ...acc,
      p.module
    ];
  }, []);

  const presetGasket = makeGasket({
    plugins: presetPlugins
  });

  console.log(presetGasket);

  await presetPromptHooks(presetGasket, context);
  console.log(context);

  // Check preset plugins vs the plugins from the presetConfig?
  // How to add conditional deps to ending package.json
  // Plugin create hook to add iteself to the package.json
  // Plugin create hook to add itself to the gasket.config.js and import
  // context.gasketConfig.addPlugin(defaultexportname, packagename)
  await presetConfigHooks(presetGasket, context);

  console.log('zzzzzz', context.presetConfig);

  const pluginGasket = makeGasket({
    ...context.presetConfig,
    plugins: presetPlugins.concat(context.presetConfig.plugins, defaultPlugins)
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
  printReport(context);

  await rm(tmpDir, { recursive: true });
  // console.log(configuredPresets)
  // console.log(configuredPresets[0].dependencies)
  // console.log(configuredPresets[0].plugins)
  // console.log(presetConfig);

  // Check preset plugins vs the plugins from the presetConfig


  //   await globalPrompts(context);
  // presetPrompt
  // presetConfig

  // const gasketPlugins = makeGasket({
  //   // plugins
  // })

  // promptHooks


  // applyPresetConfig(context);
  // await globalPrompts(context);
  // await mkDir(context);
  // await setupPkg(context);
  // await writePkg(context);
  // await installModules(context);
  // await linkModules(context);
  // await promptHooks(gasketPlugins, context);
  //   await createHooks(context);
  //   await generateFiles(context);
  //   await writeGasketConfig(context);
  //   await writePkg.update(context);
  //   await installModules.update(context);
  //   await linkModules.update(context); // relink any that were messed up by re-install
  //   await postCreateHooks(context);


  // download preset to os temp dir
  // import preset to CGA
  // makeGasket with preset
  // exec presetPrompt
  // exec presetConfig
  // makeGasket with presetConfig
  // exec prompt
  // exec create

  // console.log('Deleting tmp dir...')
  // await rm(tmpDir, { recursive: true });
}

/**
 * bootstrap - Bootstrap the application
 * @param {CreateContext} context - Create context
 */
// async function bootstrapHandler(context) {
//   await loadPreset(context);
//   cliVersion(context);
//   applyPresetConfig(context);
//   await globalPrompts(context);
//   await mkDir(context);
//   await setupPkg(context);
//   await writePkg(context);
//   await installModules(context);
//   await linkModules(context);
// }

/**
 * generate - Generate the application
 * @param {CreateContext} context - Create context
 */
// async function generateHandler(context) {
//   await promptHooks(context);
//   await createHooks(context);
//   await generateFiles(context);
//   await writeGasketConfig(context);
//   await writePkg.update(context);
//   await installModules.update(context);
//   await linkModules.update(context); // relink any that were messed up by re-install
//   await postCreateHooks(context);
// }

/**
 * createCommand action
 * @param {string} appname Required cmd arg - name of the app to create
 * @param {object} options cmd options
 * @param {Command} command - the command instance
 * @returns {Promise<void>} void
 */
// createCommand.action = async function run(appname, options, command) {
//   const argv = [appname];
//   const { bootstrap = true, generate = true } = options;

//   let context;
//   try {
//     context = makeCreateContext(argv, options);
//   } catch (error) {
//     console.error(chalk.red(error) + '\n');
//     command.help();
//   }

//   try {
//     if (bootstrap) {
//       await bootstrapHandler(context);
//     } else {
//       ora('Bootstrap phase skipped.').warn();
//       if (generate) {
//         await loadPkgForDebug(context);
//       }
//     }

//     if (generate) {
//       await generateHandler(context);
//     } else {
//       ora('Generate phase skipped.').warn();
//     }

//     printReport(context);

//   } catch (err) {
//     console.error(chalk.red('Exiting with errors.'));
//     dumpErrorContext(context, err);
//     throw err;
//   }
// };

export { createCommand };



// fire global prompts to inform pkgmanager

// const tmpDir = await mkdtemp(path.join(os.tmpdir(), `gasket-create-${context.appName}`));
// console.log(tmpDir);



// new PackageManager https://github.com/godaddy/gasket/blob/v7/packages/gasket-utils/lib/package-manager.js#L75
// const remotePresets = context.rawPresets.map(async preset => {
//   const { name: presetName, version: presetVersion } = evaluatePreset(preset)

//   // await runShellCommand('npm', ['i', `${presetName}@${presetVersion}`], { cwd: tmpDir }, true);
//   const modPath = path.join(tmpDir, 'node_modules');
//   const pkgFile = require(path.join(modPath, presetName, 'package.json'));
//   const presetMod = await import(presetName, { from: modPath });

//   const dependencies = Object.entries(pkgFile.dependencies || {})
//     .filter(([name]) => name.startsWith('@gasket'))
//     .map(([name, version]) => ({ name, version }));

//   const plugins = await Promise.all(dependencies.map(async ({ name }) => {
//     const mod = await import(name, { from: modPath });
//     return mod.default || mod;
//   }));

//   console.log(plugins)
//   return {
//     // module: await import(preset, { from: modPath }),
//     pkgFile,
//     dependencies,
//     plugins: [
//       presetMod.default || presetMod,
//       ...plugins
//     ]
//   }
// });

// const localPresets = context.localPresets.map(async localPreset => {
//   await runShellCommand('npm', ['i', localPreset], { cwd: tmpDir }, true);

//   const modPath = path.join(tmpDir, 'node_modules');
//   const pkgFile = require(path.join(localPreset, 'package.json'));
//   const presetMod = await import(pkgFile.name, { from: modPath });


//   const dependencies = Object.entries(pkgFile.dependencies || {})
//     .filter(([name]) => name.startsWith('@gasket'))
//     .map(([name, version]) => ({ name, version }));

//   const plugins = await Promise.all(dependencies.map(async ({ name }) => {
//     const mod = await import(name, { from: modPath });
//     return mod.default || mod;
//   }));

//   return {
//     // module: await import(preset, { from: modPath }),
//     pkgFile,
//     dependencies,
//     plugins: [
//       presetMod.default || presetMod,
//       ...plugins
//     ]
//   }
// });

// const presets = await Promise.all([
//   ...remotePresets,
//   ...localPresets
// ]);
