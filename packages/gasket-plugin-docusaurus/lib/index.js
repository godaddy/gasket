const docsView = require('./docs-view');
const docsSetup = require('./docs-setup');
const configure = require('./configure');

module.exports = {
  name: require('../package').name,
  hooks: {
    configure,
    docsSetup,
    docsView
  }
};
