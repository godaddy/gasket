const {
  txGasketPackageLinks,
  txGasketUrlLinks,
  txAbsoluteLinks
} = require('./utils/transforms');

/**
 * Specify what files to copy and transform
 *
 * @returns {DocsSetup} docsSetup
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
