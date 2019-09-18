const {
  txGasketPackageLinks,
  txGasketUrlLinks,
  txAbsoluteLinks
} = require('./transforms');

/**
 * Specify what files to copy and transform
 *
 * @returns {DocsSetup} docsSetup
 */

module.exports = function docs() {
  return {
    link: 'README.md',
    files: [
      'README.md',
      'CHANGELOG.md',
      'docs/**/*',
      'more-docs/**/*'
    ],
    transforms: [
      txGasketPackageLinks,
      txGasketUrlLinks,
      txAbsoluteLinks
    ]
  };
};
