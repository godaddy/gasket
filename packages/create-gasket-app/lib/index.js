#!/usr/bin/env node
require('./utils/setup');
const pkg = require('../package.json');
const { Command } = require('commander');
const program = new Command();
const CreateCommand = require('./commands/create');

const { processCommand, logo, warnIfOutdated } = require('./utils');

// Create Gasket CLI
const gasketBin = program
  .name('create-gasket-app')
  .description(pkg.description)
  .option('--gasket-config [gasket-config-path]', 'Fully qualified Gasket config to load', 'gasket.config')
  .version(pkg.version)
  .addHelpText('beforeAll', logo);


async function main() {
  const { command, hidden, isDefault } = processCommand(CreateCommand);
  await warnIfOutdated(pkg.name, pkg.version);
  gasketBin.addCommand(command, { hidden, isDefault });

  process.argv.splice(2, 0, 'create');

  return await gasketBin.parseAsync();
}

main();
