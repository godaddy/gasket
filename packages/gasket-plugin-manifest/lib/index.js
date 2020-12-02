const build = require('./build');
const express = require('./express');
const middleware = require('./middleware');

module.exports = {
  name: require('../package').name,
  hooks: {
    build,
    express,
    middleware,
    metadata(gasket, meta) {
      return {
        ...meta,
        lifecycles: [{
          name: 'manifest',
          method: 'execWaterfall',
          description: 'Modify the the web manifest for a request',
          link: 'README.md#manifest',
          parent: 'middleware'
        }]
      };
    }
  }
};
