import { createRequire } from 'module';
import presetPrompt from './preset-prompt.js';
import presetConfig from './preset-config.js';
import create from './create.js';
const require = createRequire(import.meta.url);
const { name, version, description } = require('../package.json');

// TODO: need to create types for "preset" plugins
export default {
  name,
  version,
  description,
  hooks: {
    presetPrompt,
    presetConfig,
    create
  }
};
