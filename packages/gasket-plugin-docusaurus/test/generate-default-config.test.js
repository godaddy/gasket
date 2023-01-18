/* eslint-disable no-sync */
// hoisting requires the order below
const mockReadFileStub = jest.fn();

jest.mock('fs', () => {
  const mod = jest.requireActual('fs');
  return {
    ...mod,
    promises: {
      readFile: mockReadFileStub
    }
  };
});

const path = require('path');
const fs = require('fs');
const generateDefaultConfig = require('../lib/generate-default-config');
const DEFAULT_CONFIG = fs.readFileSync(path.join(__dirname, '..', 'generator', 'docusaurus.config.js'), 'utf-8');
const GASKET_APP_NAME = 'test-gasket';
const GASKET_DOCS_OUTPUTDIR = 'my-docs';

describe('generateDefaultConfig', () => {

  beforeEach(() => {
    mockReadFileStub.mockResolvedValue(DEFAULT_CONFIG);
  });

  it('reads in default config', async function () {
    await generateDefaultConfig(GASKET_APP_NAME);
    expect(mockReadFileStub).toHaveBeenCalled();
    expect(mockReadFileStub.mock.calls[0][0]).toContain(path.join('generator', 'docusaurus.config.js'));
  });

  it('replaces "${name}" with the app name', async function () {
    const results = await generateDefaultConfig({ name: GASKET_APP_NAME });
    const nameFrequency = results.match(new RegExp(GASKET_APP_NAME, 'g'));
    expect(nameFrequency).toHaveLength(4);
    expect(results).toContain(GASKET_APP_NAME);
  });

  it('replaces "${path}" with gasket.config.docs.outputDir', async function () {
    const results = await generateDefaultConfig({ path: GASKET_DOCS_OUTPUTDIR });
    const nameFrequency = results.match(new RegExp(GASKET_DOCS_OUTPUTDIR, 'g'));
    expect(nameFrequency).toHaveLength(1);
    expect(results).toContain(GASKET_DOCS_OUTPUTDIR);
  });
});
