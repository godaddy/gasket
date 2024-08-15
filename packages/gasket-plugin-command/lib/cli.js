import { Command } from 'commander';
import { logo } from './utils/index.js';

const { default: pkg } = await import('../package.json', { assert: { type: 'json' } });
const { version } = pkg;
const program = new Command();

// Create Gasket CLI
export const gasketBin = program
  .name('gasket')
  .description('CLI for custom Gasket commands')
  .version(version)
  .addHelpText('beforeAll', logo);

export { processCommand } from './utils/index.js';
