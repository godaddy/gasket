const proxy = require('../../../proxy');

module.exports = (...args) => {
  proxy.emit('someEvent', ...args);
};
