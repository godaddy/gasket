const docsView = require('./docs-view');
const configure = require('./configure');

module.exports = {
  name: require('../package').name,
  hooks: {
    docsView,
    configure
  }
};
