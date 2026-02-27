import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockRunner, baseConfig } from '../helpers.js';

vi.mock('fs');
vi.mock('../../src/utils/fs.js', () => ({
  readJson: vi.fn()
}));

const templates = [
  {
    name: 'gasket-template-webapp-app',
    templateDir: '/repo/packages/gasket-template-webapp-app/template',
    packageDir: '/repo/packages/gasket-template-webapp-app',
    hasPackageJson: true
  }
];

describe('validate-structure', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('passes when all expected scripts and files exist', async () => {
    const fs = await import('fs');
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue([
      { name: 'gasket.js', isFile: () => true },
      { name: 'package.json', isFile: () => true }
    ]);

    const { readJson } = await import('../../src/utils/fs.js');
    readJson.mockReturnValue({
      scripts: { build: 'next build', test: 'vitest', start: 'next start', local: 'next dev' }
    });

    const config = {
      ...baseConfig,
      validateStructure: {
        expectedScripts: ['build', 'test'],
        expectedFiles: ['package.json'],
        forbiddenFiles: []
      }
    };

    const { handler } = await import('../../src/operations/validate-structure.js');
    const results = { record: vi.fn() };
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await handler(templates, { runner: mockRunner(), config, results });

    expect(results.record).toHaveBeenCalledWith('gasket-template-webapp-app', 'passed');
    consoleSpy.mockRestore();
  });

  it('fails when expected script is missing', async () => {
    const fs = await import('fs');
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue([]);

    const { readJson } = await import('../../src/utils/fs.js');
    readJson.mockReturnValue({
      scripts: { build: 'next build' }
    });

    const config = {
      ...baseConfig,
      validateStructure: {
        expectedScripts: ['build', 'test', 'lint'],
        expectedFiles: [],
        forbiddenFiles: []
      }
    };

    const { handler } = await import('../../src/operations/validate-structure.js');
    const results = { record: vi.fn() };
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await handler(templates, { runner: mockRunner(), config, results });

    expect(results.record).toHaveBeenCalledWith(
      'gasket-template-webapp-app',
      'failed',
      expect.stringContaining('missing script: test')
    );
    consoleSpy.mockRestore();
  });

  it('fails when expected file is missing', async () => {
    const fs = await import('fs');
    vi.mocked(fs.existsSync).mockImplementation((p) => {
      return !String(p).endsWith('gasket.js');
    });
    vi.mocked(fs.readdirSync).mockReturnValue([]);

    const { readJson } = await import('../../src/utils/fs.js');
    readJson.mockReturnValue({ scripts: {} });

    const config = {
      ...baseConfig,
      validateStructure: {
        expectedScripts: [],
        expectedFiles: ['gasket.js'],
        forbiddenFiles: []
      }
    };

    const { handler } = await import('../../src/operations/validate-structure.js');
    const results = { record: vi.fn() };
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await handler(templates, { runner: mockRunner(), config, results });

    expect(results.record).toHaveBeenCalledWith(
      'gasket-template-webapp-app',
      'failed',
      expect.stringContaining('missing file: gasket.js')
    );
    consoleSpy.mockRestore();
  });

  it('fails when forbidden file is present', async () => {
    const fs = await import('fs');
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue([
      { name: '.env.local', isFile: () => true }
    ]);

    const { readJson } = await import('../../src/utils/fs.js');
    readJson.mockReturnValue({ scripts: {} });

    const config = {
      ...baseConfig,
      validateStructure: {
        expectedScripts: [],
        expectedFiles: [],
        forbiddenFiles: ['.env.local']
      }
    };

    const { handler } = await import('../../src/operations/validate-structure.js');
    const results = { record: vi.fn() };
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await handler(templates, { runner: mockRunner(), config, results });

    expect(results.record).toHaveBeenCalledWith(
      'gasket-template-webapp-app',
      'failed',
      expect.stringContaining('forbidden file: .env.local')
    );
    consoleSpy.mockRestore();
  });

  it('supports regex patterns for expected files', async () => {
    const fs = await import('fs');
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue([
      { name: 'gasket.ts', isFile: () => true }
    ]);

    const { readJson } = await import('../../src/utils/fs.js');
    readJson.mockReturnValue({ scripts: {} });

    const config = {
      ...baseConfig,
      validateStructure: {
        expectedScripts: [],
        expectedFiles: [/gasket\.js|gasket\.ts/],
        forbiddenFiles: []
      }
    };

    const { handler } = await import('../../src/operations/validate-structure.js');
    const results = { record: vi.fn() };
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await handler(templates, { runner: mockRunner(), config, results });

    expect(results.record).toHaveBeenCalledWith('gasket-template-webapp-app', 'passed');
    consoleSpy.mockRestore();
  });

  it('fails when no package.json exists', async () => {
    const { readJson } = await import('../../src/utils/fs.js');
    readJson.mockReturnValue(null);

    const { handler } = await import('../../src/operations/validate-structure.js');
    const results = { record: vi.fn() };
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await handler(templates, { runner: mockRunner(), config: baseConfig, results });

    expect(results.record).toHaveBeenCalledWith('gasket-template-webapp-app', 'failed', 'no package.json');
    consoleSpy.mockRestore();
  });
});
