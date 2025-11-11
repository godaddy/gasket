import create from './create.js';
import configure from './configure.js';
import commands from './commands.js';
import metadata from './metadata.js';
import docsSetup from './docs-setup.js';
import webpackConfig from './webpack-config.js';
import prompt from './prompt.js';

import packageJson from '../package.json' with { type: 'json' };
const { name, version, description } = packageJson;

/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  version,
  description,
  hooks: {
    configure,
    create,
    commands,
    metadata,
    prompt,
    docsSetup,
    webpackConfig
  }
};

export default plugin;
