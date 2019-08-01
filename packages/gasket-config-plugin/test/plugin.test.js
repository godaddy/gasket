const { promisify } = require('util');
const path = require('path');
const plugin = require('../lib/plugin');
const { ENV_CONFIG } = require('../lib/constants');

describe('The @gasket/config-plugin', () => {
  let gasket;

  beforeEach(() => {
    gasket = {
      config: {},
      execWaterfall: jest.fn((event, config) => Promise.resolve(config))
    };
  });

  describe('preboot hook', () => {
    it('sets the environment config to {} if no config files exist', () => {
      return verify({
        withRootDir: 'no-config',
        configShouldEqual: {}
      });
    });

    it('uses a custom config directory if specified', () => {
      return verify({
        withRootDir: 'custom-dir',
        withEnv: 'production',
        withConfigPath: './src/config',
        configShouldEqual: { expected: 'config' }
      });
    });

    it('supports both .js and .json files', () => {
      return verify({
        withRootDir: 'diff-file-types',
        configShouldEqual: {
          base: 'config',
          env: 'setting'
        }
      });
    });

    it('supports a base config file', () => {
      return verify({
        withRootDir: 'base-config',
        configShouldEqual: {
          base: 'config',
          env: 'setting'
        }
      });
    });

    it('supports sub-environments', () => {
      return verify({
        withRootDir: 'sub-envs',
        withEnv: 'production.v1',
        configShouldEqual: {
          common: 'config',
          someSetting: 'overridden value'
        }
      });
    });

    it('merges the local environment settings with the dev environment', () => {
      return verify({
        withRootDir: 'local-config',
        withEnv: 'local',
        configShouldEqual: {
          urls: {
            fos: 'https://www.test-domain.com/',
            gcAPI: 'https://api.test-domain.com:8443/'
          }
        }
      });
    });

    it('supports workstation-specific config overrides', () => {
      return verify({
        withRootDir: 'local-overrides',
        withEnv: 'local',
        configShouldEqual: {
          port: 8843,
          urls: {
            fos: 'https://www.test-domain.com/',
            gcAPI: 'https://api.test-domain.com:8443/'
          }
        }
      });
    });

    it('supports `appEnvConfig` hooks', () => {
      gasket.execWaterfall.mockImplementation((event, config) => {
        expect(event).toEqual('appEnvConfig');
        return Promise.resolve({
          ...config,
          urls: Object.entries(config.urls).reduce((result, [key, value]) => ({
            goDaddy: {
              ...result.goDaddy,
              [key]: value.replace('{rootDomain}', config.rootDomain)
            },
            resellers: {
              ...result.resellers,
              [key]: value.replace('{rootDomain}', config.rootResellerDomain)
            }
          }), {})
        });
      });

      return verify({
        withRootDir: 'templated',
        withEnv: 'test',
        configShouldEqual: {
          rootDomain: 'test.domain.com',
          rootResellerDomain: 'test.net',
          urls: {
            goDaddy: {
              fos: 'https://www.test.domain.com/',
              mya: 'https://accounts.test.domain.com/products',
              gc: 'https://websites.test.domain.com/'
            },
            resellers: {
              fos: 'https://www.test.net/',
              mya: 'https://accounts.test.net/products',
              gc: 'https://websites.test.net/'
            }
          }
        }
      });
    });

    it('does not swallow errors in buggy config files', () => {
      return verify({
        withRootDir: 'invalid-config',
        shouldThrow: true
      });
    });

    async function verify({
      withRootDir,
      withEnv = 'development',
      withConfigPath,
      configShouldEqual,
      shouldThrow = false
    }) {
      Object.assign(gasket.config, {
        root: path.join(__dirname, './fixtures', withRootDir),
        env: withEnv,
        configPath: withConfigPath
      });

      try {
        await plugin.hooks.preboot(gasket);
      } catch (err) {
        if (shouldThrow) {
          return;
        }
        throw err;
      }

      if (shouldThrow) {
        throw new Error('Expected init hook to fail');
      }

      expect(gasket[ENV_CONFIG]).toEqual(configShouldEqual);
    }
  });

  describe('middleware hook', () => {
    let mockReq, mockRes;

    beforeEach(() => {
      mockReq = { mock: 'request', cookies: { market: 'de-DE' }};
      mockRes = { mock: 'response' };
    });

    it('executes before the "redux" middleware', async () => {
      expect(plugin.hooks.middleware.timing.before).toContain('redux');
    });

    it('sets a `config` property on the request object', async () => {
      const mockConfig = { some: 'config' };
      gasket[ENV_CONFIG] = mockConfig;
      const middleware = promisify(plugin.hooks.middleware.handler(gasket));

      await middleware(mockReq, mockRes);

      expect(mockReq).toHaveProperty('config', mockConfig);
    });

    it('allows `appRequestConfig` hooks to modify the config', async () => {
      gasket[ENV_CONFIG] = { some: 'config' };
      gasket.execWaterfall.mockImplementation((event, config, req, res) => {
        expect(event).toEqual('appRequestConfig');
        expect(req).toEqual(mockReq);
        expect(res).toEqual(mockRes);

        return {
          ...config,
          locale: req.cookies.market
        };
      });
      const middleware = promisify(plugin.hooks.middleware.handler(gasket));

      await middleware(mockReq, mockRes);

      expect(mockReq.config).toEqual({
        some: 'config',
        locale: 'de-DE'
      });
    });

    it('does not swallow errors from `appRequestConfig` hooks', async () => {
      gasket[ENV_CONFIG] = { some: 'config' };
      gasket.execWaterfall.mockImplementation(() => {
        return Promise.reject(new Error('Something bad'));
      });
      const middleware = promisify(plugin.hooks.middleware.handler(gasket));

      try {
        await middleware(mockReq, mockRes);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        return;
      }

      throw new Error('Middleware should have propagated an error');
    });
  });

  describe('initReduxState hook', () => {
    let req, res;

    beforeEach(() => {
      req = {};
      res = {};
    });

    it('adds the `redux` config section to the redux state', async () => {
      req.config = { something: 'private', redux: { something: 'public' }};
      const startingState = {
        auth: { some: 'details' }
      };

      const newState = await plugin.hooks.initReduxState(
        gasket,
        startingState,
        req,
        res);

      expect(newState).toEqual({
        auth: { some: 'details' },
        config: { something: 'public' }
      });
    });
  });
});
