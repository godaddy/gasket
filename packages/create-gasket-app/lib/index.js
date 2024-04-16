#!/usr/bin/env node
import { Command } from 'commander';
import { processCommand, logo, warnIfOutdated } from './utils';
import { createCommand } from './commands/create';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');
const { Command } = require('commander');
const program = new Command();

// Create Gasket CLI
const gasketBin = program
  .name('create-gasket-app')
  .description(pkg.description)
  .option('--gasket-config [gasket-config-path]', 'Fully qualified Gasket config to load', 'gasket.config')
  .version(pkg.version)
  .addHelpText('beforeAll', logo);


async function main() {
  const { command, hidden, isDefault } = processCommand(createCommand);
  await warnIfOutdated(pkg.name, pkg.version);
  gasketBin.addCommand(command, { hidden, isDefault });

  process.argv.splice(2, 0, 'create');

  return await gasketBin.parseAsync();
}

main();
