const {
  txGasketPackageLinks,
  txGasketUrlLinks,
  txAbsoluteLinks,
  txLicenseLinks
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
      'docs/**/*'
    ],
    transforms: [
      txGasketPackageLinks,
      txGasketUrlLinks,
      txAbsoluteLinks,
      txLicenseLinks
    ]
  };
};
