const path = require('path');
const plugin = require('../lib/plugin');
const { gasketDataMap } = require('../lib/data-map');

describe('Plugin', () => {
  let gasket;

  beforeEach(() => {
    gasket = {
      command: {
        id: 'start'
      },
      config: {
        env: 'test'
      },
      execWaterfall: jest.fn((event, config) => Promise.resolve(config))
    };
  });

  it('should be an object', () => {
    expect(plugin).toBeInstanceOf(Object);
  });

  it('has expected name', () => {
    expect(plugin).toHaveProperty('name', require('../package').name);
  });

  it('has expected hooks', () => {
    const expected = [
      'create',
      'preboot',
      'middleware',
      'initReduxState',
      'metadata'
    ];

    expect(plugin).toHaveProperty('hooks');

    const hooks = Object.keys(plugin.hooks);
    expect(hooks).toEqual(expected);
    expect(hooks).toHaveLength(expected.length);
  });

  /* eslint-disable jest/expect-expect */
  describe('preboot hook', () => {
    it('sets the environment config to {} if no config files exist', () => {
      return verify({
        withRootDir: 'no-config',
        shouldEqual: {}
      });
    });

    it('uses a custom config directory if specified', () => {
      return verify({
        withRootDir: 'custom-dir',
        withEnv: 'production',
        withGasketDataDir: './src/custom',
        shouldEqual: { expected: 'config' }
      });
    });

    it('supports both .js and .json files', () => {
      return verify({
        withRootDir: 'diff-file-types',
        shouldEqual: {
          base: 'config',
          env: 'setting'
        }
      });
    });

    it('supports a base config file', () => {
      return verify({
        withRootDir: 'base-config',
        shouldEqual: {
          base: 'config',
          env: 'setting'
        }
      });
    });

    it('supports sub-environments', () => {
      return verify({
        withRootDir: 'sub-envs',
        withEnv: 'production.v1',
        shouldEqual: {
          common: 'config',
          someSetting: 'overridden value'
        }
      });
    });

    it('merges the local environment settings with the dev environment', () => {
      return verify({
        withRootDir: 'local-config',
        withEnv: 'local',
        shouldEqual: {
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
        shouldEqual: {
          port: 8843,
          urls: {
            fos: 'https://www.test-domain.com/',
            gcAPI: 'https://api.test-domain.com:8443/'
          }
        }
      });
    });

    it('supports `gasketData` hooks', () => {
      gasket.execWaterfall.mockImplementation((event, config) => {
        expect(event).toEqual('gasketData');
        return Promise.resolve({
          ...config,
          urls: Object.entries(config.urls).reduce(
            (result, [key, value]) => ({
              goDaddy: {
                ...result.goDaddy,
                [key]: value.replace('{rootDomain}', config.rootDomain)
              },
              resellers: {
                ...result.resellers,
                [key]: value.replace('{rootDomain}', config.rootResellerDomain)
              }
            }),
            {}
          )
        });
      });

      return verify({
        withRootDir: 'templated',
        withEnv: 'test',
        shouldEqual: {
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

    it('descriptive error when config is not present in `gasketData` hooks', async () => {
      Object.assign(gasket.config, {
        root: path.join(__dirname, './fixtures', 'templated'),
        env: 'test'
      });

      gasket.execWaterfall.mockImplementation((event) => {
        expect(event).toEqual('gasketData');
      });

      const { preboot } = plugin.hooks;

      await expect(preboot(gasket)).rejects.toThrow(
        'An gasketData lifecycle hook did not return a config object.'
      );
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
      withGasketDataDir,
      shouldEqual,
      shouldThrow = false
    }) {
      Object.assign(gasket.config, {
        root: path.join(__dirname, './fixtures', withRootDir),
        env: withEnv,
        gasketDataDir: withGasketDataDir
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

      expect(gasketDataMap.get(gasket)).toEqual(shouldEqual);
    }
  });
  /* eslint-enable jest/expect-expect */

  describe('initReduxState hook', () => {
    let req, res;

    beforeEach(() => {
      req = {};
      res = {
        locals: {}
      };
    });

    it('adds the `public` config section to the redux state', async () => {
      res.locals.gasketData = { something: 'public' };
      const startingState = {
        auth: { some: 'details' }
      };

      const newState = await plugin.hooks.initReduxState(
        gasket,
        startingState,
        {
          req,
          res
        }
      );

      expect(newState).toEqual({
        auth: { some: 'details' },
        gasketData: { something: 'public' }
      });
    });

    it('does not overwrite any previously-present gasketData state', async () => {
      res.locals.gasketData = { something: 'public' };
      const startingState = {
        gasketData: { some: { existing: 'state' } }
      };

      const newState = await plugin.hooks.initReduxState(
        gasket,
        startingState,
        {
          req,
          res
        }
      );

      expect(newState).toEqual({
        gasketData: {
          some: { existing: 'state' },
          something: 'public'
        }
      });
    });
  });
});
