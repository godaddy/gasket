import { Command } from 'commander';
import { logo } from './utils/logo.js';
import pkg from '../package.json';
const { version } = pkg;
const program = new Command();

// Create Gasket CLI
export const gasketBin = program
  .name('gasket')
  .description('CLI for custom Gasket commands')
  .version(version)
  .addHelpText('beforeAll', logo);
