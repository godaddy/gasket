module.exports = require('@gasket/resolve/plugins')({
  dirname: __dirname,
  resolve: name => require(name)
});
