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

    it('invokes the `init` Gasket lifecycle', async () => {
      const cmd = instantiateCommand(GasketCommand);
      await cmd.init();

      assume(gasket.exec).is.calledWith('init');
    });

    it('invokes the `configure` Gasket lifecycle', async () => {
      const cmd = instantiateCommand(GasketCommand);
      await cmd.init();

      assume(gasket.execWaterfall).calledWith('configure', sinon.match.object);
    });

    it('invokes `init` before `configure`', async () => {
      const cmd = instantiateCommand(GasketCommand);

      const orderSpy = sinon.stub();
      cmd.config.gasket.exec = orderSpy;
      cmd.config.gasket.execWaterfall = orderSpy;

      await cmd.init();

      assume(orderSpy.firstCall.args[0]).equals('init');
      assume(orderSpy.secondCall.args[0]).equals('configure');
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
