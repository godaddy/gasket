const processOptions = require('../../../src/utils/commands/process-options');

describe('processOptions', () => {

  describe('isValidOption', () => {

    it('throws on invalid option', () => {
      const mockOptions = [
        { name: 'option1' },
        { description: 'description2' }
      ];
      expect(() => processOptions(mockOptions)).toThrow('Invalid option(s) configuration');
    });

    it('throws an error if options is not an array', () => {
      expect(() => processOptions({})).toThrow('Invalid option(s) configuration');
    });

    it('throws an error if options is undefined', () => {
      expect(() => processOptions()).toThrow('Invalid option(s) configuration');
    });
  });

  it('returns an array of option definitions', () => {
    const mockOptions = [
      { name: 'option1', description: 'description1', required: true, short: 'o' },
      { name: 'option2', description: 'description2', required: false, short: 't' }
    ];
    const result = processOptions(mockOptions);
    expect(result).toEqual([
      ['-o, --option1 <option1>', 'description1'],
      ['-t, --option2 [option2]', 'description2']
    ]);
  });

  it('processes boolean options', () => {
    const mockOptions = [
      { name: 'option1', description: 'description1', required: true, short: 'o', type: 'boolean' },
      { name: 'option2', description: 'description2', required: false, short: 't', type: 'boolean' }
    ];
    const result = processOptions(mockOptions);
    expect(result).toEqual([
      ['-o, --option1', 'description1'],
      ['-t, --option2', 'description2']
    ]);
  });

  it('allows for an empty array', () => {
    const result = processOptions([]);
    expect(result).toEqual([]);
  });
});
