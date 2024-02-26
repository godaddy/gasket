/* eslint-disable no-sync */
const Engine = require('@gasket/engine');
const { createConfig } = require('../lib/config');

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
      customConfig: true
    };
    result = await createConfig(gasket);
    expect(result).toHaveProperty('customConfig', true);
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
    const webpackStub = jest.fn();
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

    it('executes webpack plugin hook', () => {
      result = config.webpack(webpackConfig, data);
      // TODO: should not test this deep into webpack plugin
      expect(gasket.execWaterfallSync).toHaveBeenCalledWith(
        'webpackConfig',
        expect.any(Object),
        expect.any(Object)
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

    it('merges the return values from `webpack` into a single webpack config', async function () {
      const engine = lifecycle(
        {},
        {
          webpackConfig: function (gasketAPI) {
            expect(gasketAPI).toEqual(engine);

            return {
              resolve: {
                alias: {
                  '@gasket/example': __filename
                }
              }
            };
          }
        }
      );

      const nextConfig = await createConfig(engine);
      const resultConfig = nextConfig.webpack(
        {
          plugins: [],
          output: {},
          module: {
            rules: []
          },
          optimization: {
            splitChunks: {
              cacheGroups: {}
            },
            minimize: false
          }
        },
        { isServer: false, defaultLoaders: {}, dev: true, config: nextConfig }
      );

      expect(resultConfig.resolve.alias['@gasket/example']).toEqual(__filename);
    });

    describe('built-ins', () => {
      it('configures SASS loader', () => {
        result = config.webpack(webpackConfig, data);

        expect(
          result.module.rules.some((rule) => rule.test.test('bogus.scss'))
        ).toBeFalsy();
      });
    });
  });
});

function mockGasketApi() {
  return {
    execWaterfall: jest.fn((_, config) => config),
    execWaterfallSync: jest.fn((_, config) => config),
    exec: jest.fn().mockResolvedValue({}),
    execSync: jest.fn().mockReturnValue([]),
    execApplySync: jest.fn((_, config) => config),
    logger: {
      warn: jest.fn()
    },
    config: {
      root: '/path/to/app',
      webpack: {} // user specified webpack config
    },
    next: {}
  };
}

/**
 * Helper function to easily add plugins to a plugin engine instance
 * so we can test the execution of lifecycle events.
 *
 * @param {Object} config Configuration for the plugin engine.
 * @param {Array} plugins The plugins that need to be added.
 * @returns {PluginEngine} The plugin Engine.
 * @private
 */
function lifecycle(config = {}, ...plugins) {
  plugins = plugins.map(function (hooks, i) {
    if (hooks.hooks) return hooks;

    return {
      name: `test-${i}`,
      hooks
    };
  });

  const engine = new Engine({
    root: '/path/to/app',
    plugins: {
      add: [
        require('../lib/index'),
        require('@gasket/plugin-webpack'),
        ...plugins
      ].filter(Boolean)
    },
    nextConfig: {},
    http: {
      port: 8111
    },

    ...config
  });

  engine.logger = {
    warn: jest.fn()
  };

  return engine;
}
