#!/usr/bin/env node
import { Command } from 'commander';
import { createRequire } from 'module';
import { createCommand } from './commands/create.js';
import { processCommand, logo } from './utils/index.js';
import { warnIfOutdated } from '@gasket/utils';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');
const program = new Command();

// Create Gasket CLI
const gasketBin = program
  .name('create-gasket-app')
  .description(pkg.description)
  .option('--gasket-config [gasket-config-path]', 'Fully qualified Gasket config to load', 'gasket.config')
  .version(pkg.version)
  .addHelpText('beforeAll', logo);


/**
 * Main function to execute the Gasket CLI.
 * It suppresses deprecation warnings, processes the create command,
 * checks if the package is outdated, adds the command to the Gasket CLI,
 * inserts 'create' into the command line arguments, and parses the command.
 * @returns {Promise<Command>} A promise that resolves with the parsed command.
 */
async function main() {
  // Suppress deprecation warning for punycode in node 22
  // @ts-ignore
  process.noDeprecation = true;
  const { command, hidden, isDefault } = processCommand(createCommand);
  await warnIfOutdated(pkg.name, pkg.version);
  gasketBin.addCommand(command, { hidden, isDefault });

  process.argv.splice(2, 0, 'create');

  return await gasketBin.parseAsync();
}

main();
