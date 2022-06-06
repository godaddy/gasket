const assume = require('assume');
const docsSetup = require('../lib/docs-setup');

describe('docsSetup', () => {

  it('returns object', () => {
    const results = docsSetup();
    assume(results).is.an('object');
  });

  it('includes link', () => {
    const results = docsSetup();
    assume(results).property('link');
  });

  it('includes files', () => {
    const results = docsSetup();
    assume(results).property('files');
    assume(results.files).an('array');
  });

  it('includes expected transforms', () => {
    const {
      txGasketPackageLinks,
      txGasketUrlLinks,
      txAbsoluteLinks,
      txLicenseLinks
    } = require('../lib/utils/transforms');

    const results = docsSetup();
    assume(results).property('transforms');
    assume(results.transforms).eqls([
      txGasketPackageLinks, txGasketUrlLinks, txAbsoluteLinks, txLicenseLinks
    ]);
  });
});
