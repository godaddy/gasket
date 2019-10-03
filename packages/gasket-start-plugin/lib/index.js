const create = require('./create');
const getCommands = require('./get-commands');

module.exports = {
  name: 'start',
  hooks: {
    create,
    getCommands
  }
};
