import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { name, version, description } = require('../package.json');

// TODO: need to create types for "preset" plugins
export default {
  name,
  version,
  description,
  hooks: {},
  metadata: {
    guides: [{
      name: 'Progressive Web Apps Guide',
      description: 'Making Progressive Web Apps (PWA) with Gasket',
      link: 'docs/pwa-support.md'
    }]
  }
};
