const docsView = require('./docs-view');

module.exports = {
  name: require('../package').name,
  hooks: {
    docsView
  }
};
