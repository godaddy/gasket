import presetPrompt from './preset-prompt.js';
import presetConfig from './preset-config.js';
import create from './create.js';
import pkg from '../package.json' with { type: 'json' };
const { name, version, description } = pkg;

/** @type {import('@gasket/core').Preset} */
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
