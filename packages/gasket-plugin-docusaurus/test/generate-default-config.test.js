const assume = require('assume');
const sinon = require('sinon');
const { readFile } = require('fs').promises;
const path = require('path');
const proxyquire = require('proxyquire');
const DEFAULT_CONFIG = readFile(path.join(__dirname, '..', 'generator', 'docusaurus.config.js'), 'utf-8');
const GASKET_APP_NAME = 'test-gasket';
const GASKET_DOCS_OUTPUTDIR = 'my-docs';
const readFileStub = sinon.stub();
const generateDefaultConfig = proxyquire('../lib/generate-default-config', {
  fs: {
    promises: {
      readFile: readFileStub.resolves(DEFAULT_CONFIG)
    }
  }
});

describe('generateDefaultConfig', () => {

  it('reads in default config', async function () {
    await generateDefaultConfig(GASKET_APP_NAME);
    assume(readFileStub).called();
    assume(readFileStub.getCall(0).args[0]).includes(path.join('generator', 'docusaurus.config.js'));
  });

  it('replaces "${name}" with the app name', async function () {
    const results = await generateDefaultConfig({ name: GASKET_APP_NAME });
    const nameFrequency = results.match(new RegExp(GASKET_APP_NAME, 'g'));
    assume(nameFrequency.length).equals(4);
    assume(results).includes(GASKET_APP_NAME);
  });

  it('replaces "${path}" with gasket.config.docs.outputDir', async function () {
    const results = await generateDefaultConfig({ path: GASKET_DOCS_OUTPUTDIR });
    const nameFrequency = results.match(new RegExp(GASKET_DOCS_OUTPUTDIR, 'g'));
    assume(nameFrequency.length).equals(1);
    assume(results).includes(GASKET_DOCS_OUTPUTDIR);
  });
});
