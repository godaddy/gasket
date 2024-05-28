import { Command } from 'commander';
import { logo } from './utils/index.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { version } = require('../package.json');
const program = new Command();

// Create Gasket CLI
export const gasketBin = program
  .name('gasket')
  .description('CLI for custom Gasket commands')
  .version(version)
  .addHelpText('beforeAll', logo);

export { processCommand } from './utils/index.js';
