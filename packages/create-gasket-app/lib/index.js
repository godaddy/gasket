#!/usr/bin/env node
import { Command } from 'commander';
import { processCommand, logo, warnIfOutdated } from './utils/index.js';
import { createCommand } from './commands/create.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');
const program = new Command();

// Create Gasket CLI
const gasketBin = program
  .name('create-gasket-app')
  .description(pkg.description)
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
