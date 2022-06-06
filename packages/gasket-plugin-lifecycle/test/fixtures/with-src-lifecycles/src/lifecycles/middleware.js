const proxy = require('../../../../proxy');

module.exports = function middleware() {
  proxy.emit('middleware', ...arguments);
};
