const {
  txGasketPackageLinks,
  txGasketUrlLinks,
  txAbsoluteLinks
} = require('./utils/transforms');

/**
 * Specify what files to copy and transform
 * @type {import('@gasket/engine').HookHandler<'docsSetup'>}
 */
module.exports = function docsSetup() {
  return {
    link: 'README.md',
    files: [
      'README.md',
      'docs/**/*',
      'LICENSE.md'
    ],
    transforms: [
      txGasketPackageLinks,
      txGasketUrlLinks,
      txAbsoluteLinks
    ]
  };
};
