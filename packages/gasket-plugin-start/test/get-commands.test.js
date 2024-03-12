const getCommands = require('../lib/get-commands');

const mockGasket = {
  exec: jest.fn(),
  logger: {
    debug: jest.fn()
  },
  command: {
    options: {
      exit: ''
    }
  }
};

const testCommand = async (cmd, name, lifecycles) => {
  it('has expected id', () => {
    expect(cmd).toHaveProperty('id', name);
  });

  it('has description', () => {
    expect(cmd).toHaveProperty('description');
  });

  it('has action', () => {
    expect(cmd).toHaveProperty('action');
  });

  lifecycles.forEach(lifecycle => {
    it(`invokes ${lifecycle} lifecycle`, async () => {
      await cmd.action({});
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
    const results = getCommands(mockGasket);
    expect(results).toHaveLength(3);
    results.forEach(cmd => {
      expect(cmd).toHaveProperty('id');
      expect(cmd).toHaveProperty('description');
      expect(cmd).toHaveProperty('action');
    });
  });

  describe('BuildCommand', () => {
    const BuildCommand = getCommands(mockGasket)[0];
    testCommand(BuildCommand, 'build', ['build']);

    it('calls process.exit', async function () {
      await BuildCommand.action({ exit: false });
      expect(exitStub).toHaveBeenCalled();
      expect(mockGasket.logger.debug).toHaveBeenCalledWith('force exit');
    });

    it('does not force exit with flag', async function () {
      await BuildCommand.action({ exit: true });
      expect(exitStub).not.toHaveBeenCalled();
      expect(mockGasket.logger.debug).not.toHaveBeenCalledWith('force exit');
    });
  });

  describe('StartCommand', () => {
    const StartCommand = getCommands(mockGasket)[1];
    testCommand(StartCommand, 'start', ['preboot', 'start']);
  });

  describe('LocalCommand', () => {
    const LocalCommand = getCommands(mockGasket)[2];
    testCommand(LocalCommand, 'local', ['build', 'start']);

    it('has env flag which defaults to local', () => {
      expect(LocalCommand.options).toEqual([
        {
          name: 'env',
          description: 'Target runtime environment',
          default: 'local'
        }
      ]);
    });
  });
});
