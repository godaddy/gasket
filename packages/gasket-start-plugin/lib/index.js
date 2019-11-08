const create = require('./create');
const getCommands = require('./get-commands');

module.exports = {
  name: require('../package').name,
  hooks: {
    create,
    getCommands
  }
};
