import { describe, it, expect, beforeEach, vi } from 'vitest';
import plugin from '../lib/index.js';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { name, version, devDependencies } = require('../package.json');

describe('create', function () {
  let mockContext;
  let pkgHasStub;
  let pkgAddStub;
  let filesAddStub;

  beforeEach(function () {
    pkgHasStub = vi.fn().mockReturnValue(true);
    pkgAddStub = vi.fn();
    filesAddStub = vi.fn();

    mockContext = {
      pkg: {
        add: pkgAddStub,
        has: pkgHasStub
      },
      files: {
        add: filesAddStub
      },
      gasketConfig: {
        add: vi.fn(),
        addPlugin: vi.fn(),
        addImport: vi.fn().mockReturnThis(),
        injectValue: vi.fn()
      }
    };
  });

  it('adds itself to the dependencies', async function () {
    await plugin.hooks.create({}, mockContext);
    expect(pkgAddStub).toHaveBeenCalledWith('dependencies',
      expect.objectContaining({
        [name]: `^${version}`
      })
    );
  });

  it('adds the appropriate dependencies', async function () {
    await plugin.hooks.create({}, mockContext);
    expect(pkgAddStub).toHaveBeenCalledWith('dependencies',
      expect.objectContaining({
        '@gasket/data': devDependencies['@gasket/data']
      })
    );
  });

  it('adds generator files', async function () {
    await plugin.hooks.create({}, mockContext);
    expect(filesAddStub).toHaveBeenCalledWith(
      expect.stringContaining('generator/*.js')
    );
  });

  it('adds TS generator files', async function () {
    mockContext.typescript = true;
    await plugin.hooks.create({}, mockContext);
    expect(filesAddStub).toHaveBeenCalledWith(
      expect.stringContaining('generator/*.ts')
    );
  });

  it('adds plugin import to the gasket file', async function () {
    await plugin.hooks.create({}, mockContext);
    expect(mockContext.gasketConfig.addPlugin).toHaveBeenCalledWith('pluginData', '@gasket/plugin-data');
  });

  it('adds data file import to the gasket file', async function () {
    await plugin.hooks.create({}, mockContext);
    expect(mockContext.gasketConfig.addImport).toHaveBeenCalledWith('gasketData', './gasket-data.js');
  });

  it('adds .js import', async function () {
    mockContext.typescript = true;
    mockContext.nextServerType = 'appRouter';
    await plugin.hooks.create({}, mockContext);
    expect(mockContext.gasketConfig.addImport).toHaveBeenCalledWith('gasketData', './gasket-data.js');
  });

  it('adds data var to the gasket config', async function () {
    await plugin.hooks.create({}, mockContext);
    expect(mockContext.gasketConfig.injectValue).toHaveBeenCalledWith('data', 'gasketData');
  });
});
