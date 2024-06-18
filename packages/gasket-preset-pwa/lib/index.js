import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { name, version, description } = require('../package.json');

// TODO: need to create types for "preset" plugins
export default {
  name,
  version,
  description,
  hooks: {}
};
