const { processArgs } = require('../../../src/utils');

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

    it('throws an error if an arg is not an object', () => {
      mockArgs.push('not an object');
      expect(() => processArgs(mockArgs)).toThrow('Invalid argument(s) configuration');
    });

    it('throws an error if an arg is missing a name', () => {
      delete mockArgs[0].name;
      expect(() => processArgs(mockArgs)).toThrow('Invalid argument(s) configuration');
    });

    it('throws an error if an arg is missing a description', () => {
      delete mockArgs[0].description;
      expect(() => processArgs(mockArgs)).toThrow('Invalid argument(s) configuration');
    });

    it('throws if required is true and default is provided', () => {
      mockArgs[0].default = 'default';
      expect(() => processArgs(mockArgs)).toThrow('Invalid argument(s) configuration');
    });
  });

  it('returns an array of argument definitions', () => {
    const result = processArgs(mockArgs);
    expect(result).toEqual([
      ['<arg1>', 'description1'],
      ['[arg2]', 'description2']
    ]);
  });

  it('includes default value if provided and not required', () => {
    mockArgs[1].default = 'default';
    const result = processArgs(mockArgs);
    expect(result).toEqual([
      ['<arg1>', 'description1'],
      ['[arg2]', 'description2', 'default']
    ]);
  });

  it('allows for an empty array', () => {
    const result = processArgs([]);
    expect(result).toEqual([]);
  });
});
