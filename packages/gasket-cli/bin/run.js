#!/usr/bin/env node
const pkg = require('../package.json');
const { Command } = require('commander');
const program = new Command();
const { processCommand } = require('../src/utils/commands');
const CreateCommand = require('../src/commands/create');
const logo = require('../src/utils/logo');
const init = require('./init');

// Create Gasket CLI
const gasketBin = program
  .name('gasket')
  .description(pkg.description)
  .option('--gasket-config [gasket-config-path]', 'Fully qualified Gasket config to load', 'gasket.config')
  .version(pkg.version)
  .addHelpText('beforeAll', logo);

/**
 * Entry to the CLI
 */
async function run() {
  const cmd = process.argv[2];
  gasketBin.addCommand(processCommand(CreateCommand));

  if (cmd === 'create') return await gasketBin.parseAsync();

  await init({
    id: process.argv[2],
    config: {
      bin: gasketBin,
      root: process.cwd(),
      options: gasketBin.optsWithGlobals()
    },
    argv: process.argv
  });
}

run();
