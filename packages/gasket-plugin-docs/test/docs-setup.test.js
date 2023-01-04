// const assume = require('assume');
const docsSetup = require('../lib/docs-setup');

describe('docsSetup', () => {

  it('returns object', () => {
    const results = docsSetup();
    expect(results).toBeInstanceOf(Object);
  });

  it('includes link', () => {
    const results = docsSetup();
    expect(results).toHaveProperty('link');
  });

  it('includes files', () => {
    const results = docsSetup();
    expect(results).toHaveProperty('files');
    expect(results.files).toBeInstanceOf(Array);
  });

  it('includes specific files', () => {
    const results = docsSetup();
    expect(results.files).toHaveLength(3);
    expect(results.files).toContain('README.md')
    expect(results.files).toContain('docs/**/*')
    expect(results.files).toContain('LICENSE.md');
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
