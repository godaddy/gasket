const proxy = require('../../../proxy');

module.exports = (...args) => {
  proxy.emit('anotherEvent', ...args);
};
