const getCommands = require('../lib/get-commands');

const mockGasket = {
  exec: jest.fn()
};

describe('getCommands', () => {

  it('returns a command', () => {
    const results = getCommands(mockGasket);
    expect(results).toBeDefined();
  });

  it('command has id', () => {
    const results = getCommands(mockGasket);
    expect(results).toHaveProperty('id', 'analyze');
  });

  it('command has description', () => {
    const results = getCommands(mockGasket);
    expect(results).toHaveProperty('description');
  });

  it('command has action', () => {
    const results = getCommands(mockGasket);
    expect(results).toHaveProperty('action');
  });

  describe('instance', () => {
    const AnalyzeCommand = getCommands(mockGasket);

    it('executes build lifecycle', async () => {
      await AnalyzeCommand.action();
      expect(mockGasket.exec).toHaveBeenCalledWith('build');
    });
  });
});
