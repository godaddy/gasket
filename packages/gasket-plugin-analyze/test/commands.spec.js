const commands = require('../lib/commands');

const mockGasket = {
  exec: jest.fn()
};

describe('commands', () => {

  it('returns a command', () => {
    const results = commands(mockGasket);
    expect(results).toBeDefined();
  });

  it('command has id', () => {
    const results = commands(mockGasket);
    expect(results).toHaveProperty('id', 'analyze');
  });

  it('command has description', () => {
    const results = commands(mockGasket);
    expect(results).toHaveProperty('description');
  });

  it('command has action', () => {
    const results = commands(mockGasket);
    expect(results).toHaveProperty('action');
  });

  describe('instance', () => {
    const AnalyzeCommand = commands(mockGasket);

    it('executes build lifecycle', async () => {
      await AnalyzeCommand.action();
      expect(mockGasket.exec).toHaveBeenCalledWith('build');
    });
  });
});
