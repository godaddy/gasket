// hoisting requires the order below
import { vi } from 'vitest';
import path from 'path';
import fs from 'fs';
import generateDefaultConfig from '../lib/generate-default-config.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const fileName = fileURLToPath(import.meta.url);
const dirName = dirname(fileName);

const mockReadFileStub = vi.hoisted(() => vi.fn());

vi.mock('node:fs/promises', () => ({
  readFile: mockReadFileStub
}));

const DEFAULT_CONFIG = fs.readFileSync(path.join(dirName, '..', 'generator', 'docusaurus.config.js'), 'utf-8');
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
