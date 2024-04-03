const create = require('./create');
const configure = require('./configure');
const commands = require('./commands');
const metadata = require('./metadata');
const docsSetup = require('./docs-setup');

module.exports = {
  name: require('../package').name,
  hooks: {
    configure,
    create,
    commands,
    metadata,
    docsSetup
  }
};
