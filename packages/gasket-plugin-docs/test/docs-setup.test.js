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

  it('includes specific files', () => {
    const results = docsSetup();
    assume(results.files).lengthOf(3);
    assume(results.files)
      .includes('README.md')
      .includes('docs/**/*')
      .includes('LICENSE.md');
  });

  it('includes expected transforms', () => {
    const {
      txGasketPackageLinks,
      txGasketUrlLinks,
      txAbsoluteLinks
    } = require('../lib/utils/transforms');

    const results = docsSetup();
    assume(results).property('transforms');
    assume(results.transforms).eqls([
      txGasketPackageLinks, txGasketUrlLinks, txAbsoluteLinks
    ]);
  });
});
