const proxy = require('../../../proxy');

module.exports = {
  timing: {
    after: ['foo', 'bar']
  },
  handler() {
    proxy.emit('withTiming', ...arguments);
  }
};
