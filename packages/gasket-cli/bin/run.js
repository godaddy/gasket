#!/usr/bin/env node
// Script for instrumentation
require('../lib/utils/setup')();
const pkg = require('../package.json');
const { Command } = require('commander');
const program = new Command();
const { logo } = require('../lib/utils');
const { warnIfOutdated } = require('@gasket/utils');
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
  await warnIfOutdated(pkg.name, pkg.version);

  if (cmd === 'create') {
    return console.warn('The create command has been removed. Use npx create-gasket-app instead.');
  }

  if (isFlag) return await gasketBin.parseAsync();

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
