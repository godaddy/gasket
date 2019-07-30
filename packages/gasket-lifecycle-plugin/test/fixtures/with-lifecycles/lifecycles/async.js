const proxy = require('../../../proxy');

module.exports = async function middleware() {
  proxy.emit('middleware', ...arguments);
};
