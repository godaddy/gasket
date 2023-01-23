const getCommands = require('../lib/get-commands');

const mockGasket = {
  exec: jest.fn(),
  logger: {
    debug: jest.fn()
  },
  command: {
    flags: {
      exit: ''
    }
  }
};

class MockGasketCommand {
  constructor() {
    this.gasket = mockGasket;
  }
}

const mockFlags = {
  string: jest.fn(),
  boolean: jest.fn()
};

const mockData = { GasketCommand: MockGasketCommand, flags: mockFlags };

const testCommand = async (Command, name, lifecycles) => {
  it('has expected id', () => {
    expect(Command).toHaveProperty('id', name);
  });

  it('has description', () => {
    expect(Command).toHaveProperty('description');
  });

  it('implements gasketRun', () => {
    expect(Command.prototype).toHaveProperty('gasketRun');
  });

  const instance = new Command();

  lifecycles.map(async lifecycle => {
    it(`executes ${lifecycle} lifecycle`, async () => {
      await instance.gasketRun();
      expect(mockGasket.exec).toHaveBeenCalledWith(lifecycle);
    });
  });
};

describe('getCommands', () => {
  let exitStub;

  beforeEach(() => {
    exitStub = jest.spyOn(process, 'exit').mockImplementation(() => {});
  });

  afterEach(function () {
    jest.clearAllMocks();
  });

  it('returns commands', () => {
    const results = getCommands(mockGasket, mockData);
    expect(results).toHaveLength(3);
    results.forEach(cmd => {
      expect(cmd.prototype).toBeInstanceOf(MockGasketCommand);
    });
  });

  describe('BuildCommand', () => {
    const BuildCommand = getCommands(mockGasket, mockData)[0];
    testCommand(BuildCommand, 'build', ['build']);

    it('calls process.exit', async function () {
      const instance = new BuildCommand();
      instance.gasket.command = {
        flags: { exit: true }
      };
      await instance.gasketRun();

      expect(exitStub).toHaveBeenCalled();
      expect(mockGasket.logger.debug).toHaveBeenCalledWith('force exit');
    });

    it('does not force exit without flag', async function () {
      const instance = new BuildCommand();
      instance.gasket.command = {
        flags: {}
      };
      await instance.gasketRun();

      expect(exitStub).not.toHaveBeenCalled();
      expect(mockGasket.logger.debug).not.toHaveBeenCalledWith('force exit');
    });
  });

  describe('StartCommand', () => {
    const StartCommand = getCommands(mockGasket, mockData)[1];
    testCommand(StartCommand, 'start', ['preboot', 'start']);
  });

  describe('LocalCommand', () => {
    let LocalCommand = getCommands(mockGasket, mockData)[2];
    testCommand(LocalCommand, 'local', ['build', 'preboot', 'start']);

    it('has env flag which defaults to local', () => {
      LocalCommand = getCommands(mockGasket, mockData)[2];
      expect(LocalCommand.flags).toHaveProperty('env');
      expect(mockFlags.string).toHaveBeenCalledWith(expect.objectContaining({
        default: 'local'
      }));
    });
  });
});
