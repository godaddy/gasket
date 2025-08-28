const { createConfig } = require('../lib/utils/config');

const baseWebpackConfig = {
  plugins: [],
  module: {
    rules: []
  },
  optimization: {
    splitChunks: {
      cacheGroups: {}
    },
    minimize: false
  }
};

// eslint-disable-next-line max-statements
describe('createConfig', () => {
  let result, gasket, data;

  beforeEach(() => {
    gasket = mockGasketApi();

    data = {
      defaultLoaders: {}
    };
  });

  it('executes the `nextConfig` lifecycle', async function () {
    result = await createConfig(gasket);
    expect(gasket.execWaterfall).toHaveBeenCalledWith(
      'nextConfig',
      expect.any(Object)
    );
  });

  it('return config object for next.js', async () => {
    result = await createConfig(gasket);
    expect(typeof result).toBe('object');
  });

  it('disables x-powered-by header', async () => {
    result = await createConfig(gasket);
    expect(result).toHaveProperty('poweredByHeader', false);
  });

  it('includes `nextConfig` from gasket.config', async () => {
    gasket.config.nextConfig = {
      customConfig: 'from gasket.config'
    };
    result = await createConfig(gasket);
    expect(result).toHaveProperty('customConfig', 'from gasket.config');
  });

  it('includes `nextConfig` from arguments', async () => {
    const custom = {
      customConfig: 'from arguments'
    };
    result = await createConfig(gasket, custom);
    expect(result).toHaveProperty('customConfig', 'from arguments');
  });

  it('`nextConfig` arguments > gasket.config > defaults', async () => {
    // -- defaults
    result = await createConfig(gasket);
    expect(result).toHaveProperty('poweredByHeader', false);

    // -- gasket.config
    gasket.config.nextConfig = {
      poweredByHeader: 'from gasket.config'
    };
    result = await createConfig(gasket);
    expect(result).toHaveProperty('poweredByHeader', 'from gasket.config');

    // -- arguments
    const custom = {
      poweredByHeader: 'from arguments'
    };
    result = await createConfig(gasket, custom);
    expect(result).toHaveProperty('poweredByHeader', 'from arguments');
  });

  it('intl config options forwarded', async () => {
    gasket.config.intl = {
      defaultLocale: 'fr-FR',
      locales: ['fr-FR', 'en-US']
    };
    result = await createConfig(gasket);
    expect(result.i18n).toEqual({
      defaultLocale: 'fr-FR',
      locales: ['fr-FR', 'en-US']
    });
  });

  it('intl config only forwarded if locales set', async () => {
    gasket.config.intl = {
      defaultLocale: 'fr-FR'
    };
    result = await createConfig(gasket);
    expect(result.i18n).toBeUndefined();
  });

  it('intl config not forwarded if `intl.nextRouting` disabled', async () => {
    gasket.config.intl = {
      defaultLocale: 'fr-FR',
      locales: ['fr-FR', 'en-US'],
      nextRouting: false
    };
    result = await createConfig(gasket);
    expect(result.i18n).toBeUndefined();
  });

  it('intl config options merge with existing', async () => {
    gasket.config.intl = {
      defaultLocale: 'fr-FR',
      locales: ['fr-FR', 'en-US']
    };
    gasket.config.nextConfig = {
      i18n: {
        domains: [
          {
            domain: 'example.com',
            defaultLocale: 'en-US'
          }
        ]
      }
    };
    result = await createConfig(gasket);
    expect(result.i18n).toEqual({
      defaultLocale: 'fr-FR',
      locales: ['fr-FR', 'en-US'],
      domains: [
        {
          domain: 'example.com',
          defaultLocale: 'en-US'
        }
      ]
    });
  });

  it('intl config replaces and warns nextConfig values', async () => {
    gasket.config.intl = {
      defaultLocale: 'fr-FR',
      locales: ['fr-FR', 'en-US']
    };
    gasket.config.nextConfig = {
      i18n: {
        defaultLocale: 'fake',
        locales: ['fr-FR', 'en-US', 'bogus'],
        domains: [
          {
            domain: 'example.com',
            defaultLocale: 'en-US'
          }
        ]
      }
    };
    result = await createConfig(gasket);
    expect(result.i18n).toEqual({
      defaultLocale: 'fr-FR',
      locales: ['fr-FR', 'en-US'],
      domains: [
        {
          domain: 'example.com',
          defaultLocale: 'en-US'
        }
      ]
    });

    expect(gasket.logger.warn).toHaveBeenCalledTimes(2);
    expect(gasket.logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('nextConfig.i18n.defaultLocale')
    );
    expect(gasket.logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('nextConfig.i18n.locales')
    );
  });

  it('adds webpack hook', async () => {
    result = await createConfig(gasket);
    expect(result).toHaveProperty('webpack');
    expect(typeof result.webpack).toBe('function');
  });

  it('wraps existing nextConfig webpack hook', async () => {
    const webpackStub = vi.fn();
    gasket.config.nextConfig = {
      webpack: webpackStub
    };
    result = await createConfig(gasket);
    expect(result).toHaveProperty('webpack');
    result.webpack();
    expect(webpackStub).toHaveBeenCalled();
  });

  describe('#config.webpack', () => {
    let config, webpackConfig;
    beforeEach(async function () {
      webpackConfig = { ...baseWebpackConfig };
      config = await createConfig(gasket);
    });

    it('executes webpack plugin action', () => {
      config.webpack(webpackConfig, data);
      expect(gasket.actions.getWebpackConfig).toHaveBeenCalledWith(
        webpackConfig,
        data
      );
    });

    it('returns webpack config object', () => {
      result = config.webpack(webpackConfig, data);
      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('plugins');
      expect(result).toHaveProperty('module');
    });

    it('merges webpackConfig', () => {
      webpackConfig.bogus = 'BOGUS';
      result = config.webpack(webpackConfig, data);
      expect(result).toHaveProperty('bogus', 'BOGUS');
    });

    describe('built-ins', () => {
      it('configures SASS loader', () => {
        result = config.webpack(webpackConfig, data);

        expect(
          // eslint-disable-next-line max-nested-callbacks
          result.module.rules.some((rule) => rule.test.test('bogus.scss'))
        ).toBeFalsy();
      });
    });
  });
});

/**
 * Mock Gasket API
 * @returns {object} gasket API
 */
function mockGasketApi() {
  return {
    actions: {
      getWebpackConfig: vi.fn().mockImplementation((config) => config)
    },
    branch: vi.fn().mockReturnThis(),
    execWaterfall: vi.fn((_, config) => config),
    execWaterfallSync: vi.fn((_, config) => config),
    exec: vi.fn().mockResolvedValue({}),
    execSync: vi.fn().mockReturnValue([]),
    execApplySync: vi.fn((_, config) => config),
    logger: {
      warn: vi.fn()
    },
    config: {
      root: '/path/to/app',
      webpack: {} // user specified webpack config
    },
    next: {}
  };
}
