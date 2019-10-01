const getCommands = require('./get-commands');

const mockGasket = {
  exec: jest.fn()
};
class MockGasketCommand {
  constructor() {
    this.gasket = mockGasket;
  }
}

const mockData = { GasketCommand: MockGasketCommand };

describe('getCommands', () => {

  it('returns a command', () => {
    const results = getCommands(mockGasket, mockData);
    expect(results.prototype).toBeInstanceOf(MockGasketCommand);
  });

  it('command has id', () => {
    const results = getCommands(mockGasket, mockData);
    expect(results).toHaveProperty('id', 'analyze');
  });

  it('command has description', () => {
    const results = getCommands(mockGasket, mockData);
    expect(results).toHaveProperty('description');
  });

  it('command implements gasketRun', () => {
    const results = getCommands(mockGasket, mockData);
    expect(results.prototype).toHaveProperty('gasketRun');
  });

  describe('instance', () => {
    const AnalyzeCommand = getCommands(mockGasket, mockData);
    const instance = new AnalyzeCommand();

    it('executes build lifecycle', async () => {
      await instance.gasketRun();
      expect(mockGasket.exec).toBeCalledWith('build');
    });
  });
});
