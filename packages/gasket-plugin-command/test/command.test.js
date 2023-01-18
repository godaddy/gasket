/* eslint-disable no-process-env,jest/expect-expect,jest/no-conditional-expect */
const path = require('path');
const { hoistBaseFlags } = require('../lib/utils');

const fixturesDir = path.join(__dirname, 'fixtures');
const ignoreConfig = ['flags'];

describe('GasketCommand', function () {
  let GasketCommand;
  let MockPluginEngine;
  let gasket;

  /*
   * Returns a GasketCommand instance with the specified argv to be parsed.
   */
  function instantiateCommand(Command, argv = [], gasketConfig = {}) {
    Command = hoistBaseFlags(Command);
    const command = new Command(argv, { bin: 'gasket' });
    command.config.gasket = createMockGasketApi(gasketConfig);
    jest.spyOn(command, 'warn');
    return command;
  }

  /*
   * Simple helper that makes a mock MockPluginEngine instance.
   * This is commonly referred to as the "GasketAPI" in
   * @gasket/engine documentation.
   */
  function createMockGasketApi(gasketConfig = {}) {
    gasket = {
      config: gasketConfig,
      exec: jest.fn().mockResolvedValue(),
      execWaterfall: jest.fn((event, arg) => arg)
    };

    return gasket;
  }

  /*
   * 1. Initializes the runtime process.env for `withEnv`
   * 2. Creates & initializes a new GasketCommand for `withArgv`
   * 3. Assumes expectedConfig is equal to `command.userConfig`.
   */
  async function expectInitializedWith({
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

        expect(gasket.config[key]).toEqual(
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

  beforeEach(() => {
    process.env.NODE_ENV = 'development';

    gasket = { exec: jest.fn() };
    MockPluginEngine = jest.fn().mockReturnValue(gasket);

    jest.mock('@gasket/engine', () => MockPluginEngine);
    GasketCommand = require('../lib/command');
  });

  it('implements the expected oclif command API', () => {
    const command = new GasketCommand();
    expect(command).toBeTruthy();
    expect(command.init).toEqual(expect.any(Function));
    expect(command.run).toEqual(expect.any(Function));
  });

  it('exposes the expected Gasket command API', () => {
    const command = new GasketCommand();
    expect(command).toBeTruthy();
    expect(command.gasketRun).toEqual(expect.any(Function));
    expect(command.gasketConfigure).toEqual(expect.any(Function));
  });

  describe('.init()', () => {

    it('exposed invoked command details from gasket instance', async () => {
      class CustomCommand extends GasketCommand {}
      CustomCommand.id = 'custom';

      const cmd = instantiateCommand(CustomCommand, ['--env', 'bogus', '--config', 'fake']);
      await cmd.init();

      expect(cmd.gasket).toHaveProperty('command');
      expect(cmd.gasket.command).toHaveProperty('id', 'custom');
      expect(cmd.gasket.command).toHaveProperty('flags');
    });

    it('allows subclasses to adjust config', async () => {
      class CustomCommand extends GasketCommand {
        gasketConfigure(config) {
          return { ...config, extra: true };
        }
      }

      await expectInitializedWith({
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

      expect(gasket.exec).toHaveBeenCalledWith('init');
    });

    it('invokes the `configure` Gasket lifecycle', async () => {
      const cmd = instantiateCommand(GasketCommand);
      await cmd.init();

      expect(gasket.execWaterfall).toHaveBeenCalledWith('configure', expect.any(Object));
    });

    it('invokes `init` before `configure`', async () => {
      const cmd = instantiateCommand(GasketCommand);

      const orderSpy = jest.fn();
      cmd.config.gasket.exec = orderSpy;
      cmd.config.gasket.execWaterfall = orderSpy;

      await cmd.init();

      expect(orderSpy.mock.calls[0][0]).toEqual('init');
      expect(orderSpy.mock.calls[1][0]).toEqual('configure');
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
      const gasketRunSpy = jest.spyOn(cmd, 'gasketRun');
      await cmd.run();

      expect(gasketRunSpy).toHaveBeenCalled();
    });

    it('throws if sub-class does not implement `gasketRun` method', async () => {
      class MockCommand extends GasketCommand {}

      MockCommand.flags = { ...GasketCommand.flags };

      cmd = new MockCommand(['--root', fixturesDir]);
      cmd.config = { gasket: createMockGasketApi() };

      await cmd.init();

      // test that the error message is what we expect
      try {
        expect(await cmd.run()).toThrow();
      } catch (err) {
        expect(err.message).toContain('The `gasketRun` method must be implemented');
      }
    });
  });
});
