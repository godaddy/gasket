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
    expect(results.docusaurus).toBeTruthy();
  });

  it('define the docusaurus config "rootDir" if it doesn\'t exist"', async function () {
    const results = await configure.handler(mockGasket, mockGasket.config);
    expect(results.docusaurus.rootDir).toBeTruthy();
  });

  it('set default docusaurus "rootDir" to ".docs"', async function () {
    const results = await configure.handler(mockGasket, mockGasket.config);
    expect(results.docusaurus.rootDir).toEqual('.docs');
  });

  it('define docs property in gasket config if it doesn\'t exist', async function () {
    const results = await configure.handler(mockGasket, mockGasket.config);
    expect(results.docs).toBeTruthy();
  });

  it('sets default docs outputDir to ".docs/docs"', async function () {
    const results = await configure.handler(mockGasket, mockGasket.config);
    expect(results.docs.outputDir).toEqual('.docs/docs');
  });

  it('override gasket config docs property', async function () {
    mockGasket.config.docusaurus = { rootDir: 'site-docs', docsDir: 'my-docs' };
    const results = await configure.handler(mockGasket, mockGasket.config);
    expect(results.docs.outputDir).toEqual('site-docs/my-docs');
    expect(results.docusaurus.rootDir).toEqual('site-docs');
    expect(results.docusaurus.docsDir).toEqual('my-docs');
  });
});
