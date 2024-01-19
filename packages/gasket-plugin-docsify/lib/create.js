module.exports = function create(_gasket, { pkg }) {
  // Workaround for https://github.com/docsifyjs/docsify/issues/2345
  pkg.add('devDependencies', {
    'strip-indent': '^3.0.0'
  });
};
