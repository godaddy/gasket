const configure = require('./configure');
const getCommands = require('./get-commands');
const metadata = require('./metadata');
const docsSetup = require('./docs-setup');

module.exports = {
  name: require('../package').name,
  hooks: {
    configure,
    getCommands,
    metadata,
    docsSetup
  }
};
