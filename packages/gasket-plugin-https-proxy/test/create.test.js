import { vi, describe, it, expect, beforeEach } from 'vitest';
import plugin from '../lib/index.js';
import pkg from '../package.json' with { type: 'json' };
const { name, version } = pkg;

describe('create', () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      pkg: {
        add: vi.fn()
      },
      gasketConfig: {
        addPlugin: vi.fn()
      }
    };
  });

  it('add plugin to gasketConfig', () => {
    plugin.hooks.create({}, mockContext);

    expect(mockContext.gasketConfig.addPlugin).toHaveBeenCalledWith('pluginHttpsProxy', '@gasket/plugin-https-proxy');
  });

  it('add plugin to package.json dependencies', () => {
    plugin.hooks.create({}, mockContext);

    expect(mockContext.pkg.add).toHaveBeenCalledWith('dependencies', {
      [name]: `^${version}`
    });
  });
});
