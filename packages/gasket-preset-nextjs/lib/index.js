import { createRequire } from 'module';
import presetPrompt from './preset-prompt.js';
import presetConfig from './preset-config.js';
const require = createRequire(import.meta.url);
const { name } = require('../package.json');

export default {
  name,
  hooks: {
    presetPrompt,
    presetConfig
  }
};
