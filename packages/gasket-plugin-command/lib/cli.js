import { Command } from 'commander';
import { logo } from './utils/logo.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pkgJson = require('../package.json');
const { version } = pkgJson;
const program = new Command();

// Create Gasket CLI
export const gasketBin = program
  .name('gasket')
  .description('CLI for custom Gasket commands')
  .version(version)
  .addHelpText('beforeAll', logo);
