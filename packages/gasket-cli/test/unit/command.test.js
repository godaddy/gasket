const assume = require('assume');
const path = require('path');
const proxyquire = require('proxyquire');
const { spy, stub } = require('sinon');

const fixturesDir = path.join(__dirname, 'fixtures');

describe('GasketCommand', function () {
  let GasketCommand;
  let PluginEngine;
  let gasket;

  this.timeout(10000);

  /*
   * Returns a new base GasketCommand with the specified
   * argv to be parsed.
   */
  function createGasketCommand(argv = [], gasketConfig = {}) {
    const command = new GasketCommand(argv, { bin: 'gasket' });
    command.config.gasket = createMockGasketApi(gasketConfig);
    return command;
  }

  /*
   * Simple helper that makes a mock PluginEngine instance.
   * This is commonly referred to as the "GasketAPI" in
   * @gasket/plugin-engine documentation.
   */
  function createMockGasketApi(gasketConfig = {}) {
    gasket = {
      config: gasketConfig,
      exec: stub().resolves()
    };

    return gasket;
  }

  /*
   * 1. Initializes the runtime process.env for `withEnv`
   * 2. Creates & initializes a new GasketCommand for `withArgv`
   * 3. Assumes expectedConfig is equal to `command.userConfig`.
   */
  async function assumeInitializedWith({
    withArgv,
    withEnv = {},
    withGasketConfig,
    expectedConfig
  }) {
    // Overwrite process.env values
    const priorEnv = {};
    Object.keys(withEnv).forEach(key => {
      priorEnv[key] = process.env[key];
      process.env[key] = withEnv[key];
    });

    try {
      const command = createGasketCommand(withArgv, withGasketConfig);
      await command.init();

      Object.keys(gasket.config).forEach(key => {
        assume(gasket.config[key]).deep.equals(
          expectedConfig[key],
          `Expected "${key}" config not equal`
        );
      });
    } finally {
      // Restore process.env values
      Object.keys(priorEnv).forEach(key => {
        process.env[key] = priorEnv[key];
      });
    }
  }

  beforeEach((done) => {
    process.env.NODE_ENV = 'development';

    gasket = { exec: spy() };
    PluginEngine = stub().returns(gasket);

    GasketCommand = proxyquire('../../src/command', {
      '@gasket/plugin-engine': PluginEngine
    });

    done();
  });

  it('has the expected API', () => {
    const command = new GasketCommand();
    assume(command);
    assume(command.configure).is.a('asyncfunction');
    assume(command.init).is.a('asyncfunction');
    assume(command.run).is.a('asyncfunction');
  });

  describe('.init()', () => {
    it('deep merges in environment-specific configurations', async () => {
      await assumeInitializedWith({
        withEnv: { NODE_ENV: 'test' },
        withGasketConfig: require('../fixtures/gasket.config.envs'),
        withArgv: [
          '--root', fixturesDir,
          '--env', 'test'
        ],
        expectedConfig: {
          env: 'test',
          someService: {
            url: 'https://some-test.url/',
            requestRate: 9000
          },
          anotherService: {
            url: 'https://another-test.url/'
          },
          other: 'setting'
        }
      });
    });

    it('--env arg takes priority over NODE_ENV', async () => {
      await assumeInitializedWith({
        withEnv: { NODE_ENV: 'production' },
        withGasketConfig: require('../fixtures/gasket.config.envs'),
        withArgv: [
          '--root', fixturesDir,
          '--env', 'test'
        ],
        expectedConfig: {
          env: 'test',
          someService: {
            url: 'https://some-test.url/',
            requestRate: 9000
          },
          anotherService: {
            url: 'https://another-test.url/'
          },
          other: 'setting'
        }
      });
    });

    it('supports merging in sub-environment settings', async () => {
      await assumeInitializedWith({
        withArgv: [
          '--root', fixturesDir,
          '--env', 'prod.dc2'
        ],
        withGasketConfig: require('../fixtures/gasket.config.dcs'),
        expectedConfig: {
          env: 'prod.dc2',
          someService: {
            url: 'http://some-prod.dc2.url/',
            extraSecure: true
          },
          other: 'setting'
        }
      });
    });

    it('supports merging local with the development environment', async () => {
      await assumeInitializedWith({
        withArgv: [
          '--env', 'local'
        ],
        withGasketConfig: {
          root: fixturesDir,
          ...require('../fixtures/gasket.config.envs')
        },
        expectedConfig: {
          root: fixturesDir,
          env: 'local',
          someService: {
            requestRate: 9000,
            url: 'https://local.some-dev.url/'
          },
          anotherService: {
            url: 'https://another-dev.url/'
          },
          other: 'setting'
        }
      });
    });

    it('supports environment identifiers in config', async () => {
      delete process.env.NODE_ENV;

      await assumeInitializedWith({
        withArgv: [],
        withGasketConfig: require('../fixtures/gasket.config.with-env'),
        expectedConfig: {
          env: 'prod.dc1',
          someService: {
            url: 'http://some-prod.dc1.url/',
            extraSecure: true
          },
          other: 'setting'
        }
      });
    });

    it('defaults to development when not set in config.env , --env, or NODE_ENV', async () => {
      delete process.env.NODE_ENV;

      await assumeInitializedWith({
        withGasketConfig: require('../fixtures/gasket.config'),
        expectedConfig: {
          env: 'development',
          some: 'config'
        }
      });
    });

    it('overrides any "env" in config with --env', async () => {
      await assumeInitializedWith({
        withArgv: [
          '--env', 'test'
        ],
        withGasketConfig: require('../fixtures/gasket.config.with-env'),
        expectedConfig: {
          env: 'test',
          someService: {
            url: 'https://some-test.url/',
            extraSecure: false
          },
          other: 'setting'
        }
      });
    });
  });

  describe('.run()', () => {
    let cmd;

    beforeEach(async () => {
      class MockCommand extends GasketCommand {
        runHooks() {}
      }

      MockCommand.flags = { ...GasketCommand.flags };

      cmd = new MockCommand(['--root', fixturesDir]);
      cmd.config = { gasket: createMockGasketApi() };

      await cmd.init();
    });

    it('invokes the `init` hooks', async () => {
      await cmd.run();

      assume(gasket.exec).is.calledWith('init');
    });
  });
});
