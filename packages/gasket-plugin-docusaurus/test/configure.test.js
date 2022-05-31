const assume = require('assume');
const configure = require('../lib/configure');

describe('configure', () => {
  let mockGasket;

  beforeEach(() => {
    mockGasket = {
      config: {
        root: '/path/to/app/'
      }
    };
  });

  it('define default docusaurus config if it doesn\'t exist', async function () {
    const results = await configure.handler(mockGasket, mockGasket.config);
    assume(results.docusaurus).exists();
  });

  it('define the docusaurus config "rootDir" if it doesn\'t exist"', async function () {
    const results = await configure.handler(mockGasket, mockGasket.config);
    assume(results.docusaurus.rootDir).exists();
  });

  it('set default docusaurus "rootDir" to ".docs"', async function () {
    const results = await configure.handler(mockGasket, mockGasket.config);
    assume(results.docusaurus.rootDir).equals('.docs');
  });

  it('define docs property in gasket config if it doesn\'t exist', async function () {
    const results = await configure.handler(mockGasket, mockGasket.config);
    assume(results.docs).exists();
  });

  it('sets default docs outputDir to ".docs/docs"', async function () {
    const results = await configure.handler(mockGasket, mockGasket.config);
    assume(results.docs.outputDir)
      .exists()
      .equals('.docs/docs');
  });

  it('override gasket config docs property', async function () {
    mockGasket.config.docusaurus = { rootDir: 'site-docs', docsDir: 'my-docs' };
    const results = await configure.handler(mockGasket, mockGasket.config);
    assume(results.docs.outputDir).equals('site-docs/my-docs');
    assume(results.docusaurus.rootDir).equals('site-docs');
    assume(results.docusaurus.docsDir).equals('my-docs');
  });
});
