/* eslint-disable no-process-env */
const assume = require('assume');
const path = require('path');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const { hoistBaseFlags } = require('../lib/utils');

const fixturesDir = path.join(__dirname, 'fixtures');
const ignoreConfig = ['flags'];

describe('GasketCommand', function () {
  let GasketCommand;
  let PluginEngine;
  let gasket;

  /*
   * Returns a GasketCommand instance with the specified argv to be parsed.
   */
  function instantiateCommand(Command, argv = [], gasketConfig = {}) {
    Command = hoistBaseFlags(Command);
    const command = new Command(argv, { bin: 'gasket' });
    command.config.gasket = createMockGasketApi(gasketConfig);
    sinon.stub(command, 'warn');
    return command;
  }

  /*
   * Simple helper that makes a mock PluginEngine instance.
   * This is commonly referred to as the "GasketAPI" in
   * @gasket/engine documentation.
   */
  function createMockGasketApi(gasketConfig = {}) {
    gasket = {
      config: gasketConfig,
      exec: sinon.stub().resolves(),
      execWaterfall: sinon.stub().callsFake((event, arg) => arg)
    };

    return gasket;
  }

  /*
   * 1. Initializes the runtime process.env for `withEnv`
   * 2. Creates & initializes a new GasketCommand for `withArgv`
   * 3. Assumes expectedConfig is equal to `command.userConfig`.
   */
  async function assumeInitializedWith({
    withCommand = GasketCommand,
    withArgv,
    withEnv = {},
    withGasketConfig,
    expectedConfig
  }) {
    const command = instantiateCommand(withCommand, withArgv, withGasketConfig);

    // Overwrite process.env values
    const priorEnv = {};
    Object.keys(withEnv).forEach(key => {
      priorEnv[key] = process.env[key];
      process.env[key] = withEnv[key];
    });

    try {
      await command.init();

      Object.keys(gasket.config).forEach(key => {
        // if our test doesn't case and is safe to ignore
        if (ignoreConfig.includes(key) && !expectedConfig[key]) return;

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

    gasket = { exec: sinon.spy() };
    PluginEngine = sinon.stub().returns(gasket);

    GasketCommand = proxyquire('../lib/command', {
      '@gasket/engine': PluginEngine
    });

    done();
  });

  it('implements the expected oclif command API', () => {
    const command = new GasketCommand();
    assume(command);
    assume(command.init).is.a('asyncfunction');
    assume(command.run).is.a('asyncfunction');
  });

  it('exposes the expected Gasket command API', () => {
    const command = new GasketCommand();
    assume(command);
    assume(command.gasketRun).is.a('asyncfunction');
    assume(command.gasketConfigure).is.a('asyncfunction');
  });

  describe('.init()', () => {
    it('deep merges in environment-specific configurations', async () => {
      await assumeInitializedWith({
        withEnv: { NODE_ENV: 'test' },
        withGasketConfig: require('./fixtures/gasket.config.envs'),
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
        withGasketConfig: require('./fixtures/gasket.config.envs'),
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
        withGasketConfig: require('./fixtures/gasket.config.dcs'),
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
          ...require('./fixtures/gasket.config.envs')
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
        withGasketConfig: require('./fixtures/gasket.config.with-env'),
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
        withGasketConfig: require('./fixtures/gasket.config'),
        expectedConfig: {
          env: 'development',
          some: 'config',
          plugins: {}
        }
      });
    });

    it('warns if env falls back to development', async () => {
      delete process.env.NODE_ENV;

      const cmd = instantiateCommand(GasketCommand);
      await cmd.init();

      assume(cmd.warn).calledWithMatch('falling back to "development"');
    });

    it('overrides any "env" in config with --env', async () => {
      await assumeInitializedWith({
        withArgv: [
          '--env', 'test'
        ],
        withGasketConfig: require('./fixtures/gasket.config.with-env'),
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

    it('exposed invoked command details from gasket instance', async () => {
      class CustomCommand extends GasketCommand {}
      CustomCommand.id = 'custom';

      const cmd = instantiateCommand(CustomCommand, ['--env', 'bogus', '--config', 'fake']);
      await cmd.init();

      assume(cmd.gasket).property('command');
      assume(cmd.gasket.command).property('id', 'custom');
      assume(cmd.gasket.command).property('flags');
      // assume(cmd.gasket.config.flags).property('root');
      // assume(cmd.gasket.config.flags).property('config', 'fake');
      // assume(cmd.gasket.config.flags).property('env', 'bogus');
    });

    it('allows subclasses to adjust config', async () => {
      class CustomCommand extends GasketCommand {
        gasketConfigure(config) {
          return { ...config, extra: true };
        }
      }

      await assumeInitializedWith({
        withCommand: CustomCommand,
        withGasketConfig: require('./fixtures/gasket.config'),
        expectedConfig: {
          env: 'development',
          some: 'config',
          plugins: {},
          extra: true
        }
      });
    });

    it('allows subclasses to override env in config or flags', async () => {
      class CustomCommand extends GasketCommand {
        gasketConfigure(config) {
          return { ...config, env: 'test' };
        }
      }

      await assumeInitializedWith({
        withArgv: [
          '--env', 'prod'
        ],
        withCommand: CustomCommand,
        withGasketConfig: require('./fixtures/gasket.config.with-env'),
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

    it('invokes the configure Gasket lifecycle', async () => {
      class CustomCommand extends GasketCommand {
        gasketConfigure(config) {
          return { ...config, env: 'test' };
        }
      }

      const cmd = instantiateCommand(CustomCommand);
      await cmd.init();

      assume(gasket.execWaterfall).calledWith('configure', sinon.match.object);
    });
  });

  describe('.run()', () => {
    let cmd;

    beforeEach(async () => {
      class MockCommand extends GasketCommand {
        gasketRun() {}
      }

      MockCommand.flags = { ...GasketCommand.flags };

      cmd = new MockCommand(['--root', fixturesDir]);
      cmd.config = { gasket: createMockGasketApi() };

      await cmd.init();
    });

    it('invokes the `init` Gasket lifecycle', async () => {
      await cmd.run();

      assume(gasket.exec).is.calledWith('init');
    });

    it('invokes the `gasketRun` method', async () => {
      const gasketRunSpy = sinon.spy(cmd, 'gasketRun');
      await cmd.run();

      assume(gasketRunSpy).is.called();
    });

    it('throws if sub-class does not implement `gasketRun` method', async () => {
      class MockCommand extends GasketCommand {}

      MockCommand.flags = { ...GasketCommand.flags };

      cmd = new MockCommand(['--root', fixturesDir]);
      cmd.config = { gasket: createMockGasketApi() };

      await cmd.init();
      await assume(cmd.run()).throwAsync();

      // test that the error message is what we expect
      cmd.run().catch(err => {
        assume(err.message).includes('The `gasketRun` method must be implemented');
      });
    });
  });
});
