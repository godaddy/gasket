#!/usr/bin/env node
import { Command } from 'commander';
const program = new Command();
import { processCommand } from '../src/utils/commands/index.js';
import { CreateCommand } from '../src/commands/create.js';
import { logo } from '../src/utils/logo.js';
import { init } from './init.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pkg = require('../package.json');

// Create Gasket CLI
const gasketBin = program
  .name('gasket')
  .description(pkg.description)
  .option('--gasket-config [gasket-config-path]', 'Fully qualified Gasket config to load', 'gasket.config.js')
  .version(pkg.version)
  .addHelpText('beforeAll', logo);

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
};

run();
