const assume = require('assume');
const sinon = require('sinon');
const configure = require('../lib/configure');

describe('configure', () => {
  let mockGasket;

  beforeEach(() => {
    mockGasket = {
      logger: {
        warning: sinon.stub()
      },
      config: {
        root: '/path/to/app/'
      }
    };
  });

  it('define default docusaurus config if it doesn\'t exist', async function () {
    const results = await configure.handler(mockGasket, mockGasket.config);
    assume(results.docusaurus).exists();
  });

  it('define the docusaurus config "docsDir if it doesn\'t exist"', async function () {
    const results = await configure.handler(mockGasket, mockGasket.config);
    assume(results.docusaurus.docsDir).exists();
  });

  it('set default docusaurus "docsDir" to ".docs"', async function () {
    const results = await configure.handler(mockGasket, mockGasket.config);
    assume(results.docusaurus.docsDir).equals('.docs');
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
    mockGasket.config.docs = { outputDir: 'my-docs' };
    mockGasket.config.docusaurus = { docsDir: 'site-docs' };
    const results = await configure.handler(mockGasket, mockGasket.config);
    assume(mockGasket.logger.warning).called();
    assume(results.docs.outputDir).equals('site-docs/docs');
    assume(results.docusaurus.docsDir).equals('site-docs');
  });
});
