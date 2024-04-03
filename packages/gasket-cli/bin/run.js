#!/usr/bin/env node
// Script for instrumentation
require('../lib/utils/setup')();
const pkg = require('../package.json');
const { Command } = require('commander');
const program = new Command();
const CreateCommand = require('../lib/commands/create');
const { processCommand, logo, warnIfOutdated } = require('../lib/utils');
const init = require('../lib/init');

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
  const isFlag = cmd && cmd.charAt(0) === '-';
  const { command, hidden, isDefault } = processCommand(CreateCommand);
  await warnIfOutdated(pkg.name, pkg.version);
  gasketBin.addCommand(command, { hidden, isDefault });

  if (cmd === 'create' || isFlag) return await gasketBin.parseAsync();

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
