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

  it('command implements runHooks', () => {
    const results = getCommands(mockGasket, mockData);
    expect(results.prototype).toHaveProperty('runHooks');
  });

  describe('instance', () => {
    const DocsCommand = getCommands(mockGasket, mockData);
    const instance = new DocsCommand();

    it('executes build lifecycle', async () => {
      await instance.runHooks();
      expect(mockGasket.exec).toBeCalledWith('build');
    });
  });
});
