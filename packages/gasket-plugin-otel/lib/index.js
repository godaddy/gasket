const { name, dependencies } = require('../package.json');
const path = require('path');

module.exports = {
  name,
  hooks: {
    create(gasket, { pkg, files }) {
      files.add(`${path.join(__dirname, '..', 'generator')}/*`);
      pkg.add('dependencies', dependencies);
      pkg.add('scripts', {
        start: 'node --import ./instrumentation.js server.js'
      });
    }
  }
};
