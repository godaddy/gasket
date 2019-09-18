const configure = require('./configure');
const getCommands = require('./get-commands');
const metadata = require('./metadata');
const docs = require('./docs');

module.exports = {
  name: 'docs',
  hooks: {
    configure,
    getCommands,
    metadata,
    docs
  }
};
