import { describe, expect, it } from 'vitest';
import nextConfig from '../lib/next-config.js';

describe('nextConfig', function () {
  it('returns the existing config when gasket.config.turbopack is unset', function () {
    const config = { webpack: function webpack() {} };

    expect(nextConfig({ config: {} }, config)).toBe(config);
  });

  it('returns the existing config when gasket.config.turbopack is false', function () {
    const config = { webpack: function webpack() {} };

    expect(nextConfig({ config: { turbopack: false } }, config)).toBe(config);
  });

  it('removes webpack configuration under Turbopack', function () {
    const result = nextConfig(
      { config: { turbopack: true } },
      { webpack: function webpack() {} }
    );

    expect(result).not.toHaveProperty('webpack');
  });

  it('externalizes only @gasket/core and @gasket/plugin-nextjs (does not auto-scan other plugins)', function () {
    const gasket = {
      config: {
        turbopack: true,
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
      '@gasket/plugin-nextjs'
    ]);
  });

  it('preserves and deduplicates existing server externals', function () {
    const result = nextConfig(
      { config: { turbopack: true } },
      { serverExternalPackages: ['existing-package', '@gasket/core'] }
    );

    expect(result.serverExternalPackages).toEqual([
      'existing-package',
      '@gasket/core',
      '@gasket/plugin-nextjs'
    ]);
  });
});
