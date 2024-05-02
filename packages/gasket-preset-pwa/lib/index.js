import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { name, dependencies } = require('../package.json');

export default {
  name,
  hooks: {
    create(gasket, { pkg }) {
      pkg.add('dependencies', dependencies);
    }
  },
  metadata: {
    guides: [{
      name: 'Progressive Web Apps Guide',
      description: 'Making Progressive Web Apps (PWA) with Gasket',
      link: 'docs/pwa-support.md'
    }]
  }
};
