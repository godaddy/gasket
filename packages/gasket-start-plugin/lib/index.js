const create = require('./create');
const getCommands = require('./get-commands');

module.exports = {
  name: '@gasket/start',
  hooks: {
    create,
    getCommands
  }
};
