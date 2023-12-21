module.exports = function create(_gasket, { pkg }) {
  // Workaround for https://github.com/docsifyjs/docsify/issues/2345
  pkg.add('dependencies', {
    'strip-indent': require('docsify/package.json').dependencies['strip-indent']
  });
};
