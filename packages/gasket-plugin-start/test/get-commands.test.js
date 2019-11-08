const assume = require('assume');
const sinon = require('sinon');
const getCommands = require('../lib/get-commands');

const mockGasket = {
  exec: sinon.stub()
};

class MockGasketCommand {
  constructor() {
    this.gasket = mockGasket;
  }
}

const mockFlags = { string: sinon.stub() };

const mockData = { GasketCommand: MockGasketCommand, flags: mockFlags };

const testCommand = async (Command, name, lifecycles) => {
  it('has expected id', () => {
    assume(Command).property('id', name);
  });

  it('has description', () => {
    assume(Command).property('description');
  });

  describe('gasketRun', async () => {

    it('implements gasketRun', () => {
      assume(Command.prototype).property('gasketRun');
    });

    const instance = new Command();

    return Promise.all(lifecycles.map(async lifecycle => {
      it(`executes ${lifecycle} lifecycle`, async () => {
        await instance.gasketRun();
        assume(mockGasket.exec).calledWith(lifecycle);
      });
    }));
  });
};

describe('getCommands', () => {

  beforeEach(() => {
    sinon.resetHistory();
  });

  it('returns commands', () => {
    const results = getCommands(mockGasket, mockData);
    assume(results).lengthOf(3);
    results.forEach(cmd => {
      assume(cmd.prototype).instanceOf(MockGasketCommand);
    });
  });

  describe('BuildCommand', () => {
    const BuildCommand = getCommands(mockGasket, mockData)[0];
    testCommand(BuildCommand, 'build', ['build']);
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
      assume(LocalCommand.flags).property('env');
      assume(mockFlags.string).calledWithMatch({
        default: 'local'
      });
    });
  });
});
