const processCommand = require('../../../src/utils/commands/process-command');

describe('process-command', () => {

  describe('isValidCommand', () => {
    it('throws error for undefined command', () => {
      expect(() => processCommand({})).toThrow('Invalid command configuration');
    });

    it('throws error on missing id', () => {
      expect(() => processCommand({ description: 'test', action: () => {} })).toThrow('Invalid command configuration');
    });

    it('throws error on missing description', () => {
      expect(() => processCommand({ id: 'test', action: () => {} })).toThrow('Invalid command configuration');
    });

    it('throws error on missing action', () => {
      expect(() => processCommand({ id: 'test', description: 'test' })).toThrow('Invalid command configuration');
    });
  });

  it('processes command', () => {
    const command = {
      id: 'test',
      description: 'test command',
      action: () => {},
      args: [{ name: 'arg', description: 'arg description' }],
      options: [{ name: 'option', description: 'option description' }]
    };
    const result = processCommand(command);
    expect(result).toBeDefined();
    expect(result._name).toEqual('test');
    expect(result._description).toEqual('test command');
    expect(result._args).toHaveLength(1);
    expect(result.options).toHaveLength(1);
  });
});
