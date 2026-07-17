import { afterEach, describe, expect, it } from 'vitest';
import nextConfig from '../lib/next-config.js';

// eslint-disable-next-line no-process-env
const processEnv = process.env;
const originalTurbopack = processEnv.TURBOPACK;

describe('nextConfig', function () {
  afterEach(function () {
    if (typeof originalTurbopack === 'undefined') {
      delete processEnv.TURBOPACK;
    } else {
      processEnv.TURBOPACK = originalTurbopack;
    }
  });

  it('returns the existing config when Turbopack is disabled', function () {
    delete processEnv.TURBOPACK;
    const config = { webpack: function webpack() {} };

    expect(nextConfig({ config: {} }, config)).toBe(config);
  });

  it('removes webpack configuration under Turbopack', function () {
    processEnv.TURBOPACK = '1';

    const result = nextConfig({ config: {} }, { webpack: function webpack() {} });

    expect(result).not.toHaveProperty('webpack');
  });

  it('externalizes Gasket core and loaded plugins', function () {
    processEnv.TURBOPACK = '1';
    const gasket = {
      config: {
        plugins: [
          { name: '@gasket/plugin-nextjs' },
          { name: '@godaddy/gasket-plugin-uxp' },
          { name: 'local-plugin' },
          {}
        ]
      }
    };

    const result = nextConfig(gasket, {});

    expect(result.serverExternalPackages).toEqual([
      '@gasket/core',
      '@gasket/plugin-nextjs',
      '@godaddy/gasket-plugin-uxp'
    ]);
  });

  it('preserves and deduplicates existing server externals', function () {
    processEnv.TURBOPACK = '1';
    const gasket = {
      config: {
        plugins: [{ name: '@gasket/plugin-nextjs' }]
      }
    };

    const result = nextConfig(gasket, {
      serverExternalPackages: ['existing-package', '@gasket/core']
    });

    expect(result.serverExternalPackages).toEqual([
      'existing-package',
      '@gasket/core',
      '@gasket/plugin-nextjs'
    ]);
  });
});
