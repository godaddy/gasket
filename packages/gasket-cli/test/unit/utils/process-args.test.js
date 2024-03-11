const processArgs = require('../../../src/utils/commands/process-args');

describe('processArgs', () => {
  let mockArgs;

  beforeEach(() => {
    mockArgs = [
      { name: 'arg1', description: 'description1', required: true },
      { name: 'arg2', description: 'description2', required: false }
    ];
  });

  describe('isValidArg', () => {

    it('throws an error if args is not an array', () => {
      expect(() => processArgs({})).toThrow('Invalid argument(s) configuration');
    });

    it('throws an error if args is not an array of valid args', () => {
      expect(() => processArgs()).toThrow('Invalid argument(s) configuration');
    });
  });

  it('returns an array of argument definitions', () => {
    const result = processArgs(mockArgs);
    expect(result).toEqual([
      ['<arg1>', 'description1'],
      ['[arg2]', 'description2']
    ]);
  });

  it('allows for an empty array', () => {
    const result = processArgs([]);
    expect(result).toEqual([]);
  });
});
