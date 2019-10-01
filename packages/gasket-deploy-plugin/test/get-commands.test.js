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

const mockData = { GasketCommand: MockGasketCommand };

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
    const LocalCommand = getCommands(mockGasket, mockData)[2];
    testCommand(LocalCommand, 'local', ['build', 'preboot', 'start']);

    describe('gasketConfigure', () => {
      it('implements gasketConfigure', () => {
        assume(LocalCommand.prototype).property('gasketConfigure');
        assume(LocalCommand.prototype.gasketConfigure).an('asyncfunction');
      });

      it('forces env to local', async () => {
        const inst = new LocalCommand();
        const results = await inst.gasketConfigure({ env: 'test' });
        assume(results).property('env', 'local');
      });
    });
  });
});
