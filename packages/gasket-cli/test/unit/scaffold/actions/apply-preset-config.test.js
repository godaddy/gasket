const apply = require('../../../../src/scaffold/actions/apply-preset-config');

describe('applyPresetConfig', function () {
  it('should not override anything if there is not a create object', function () {
    const context = {};
    apply(context);
    expect(Object.keys(context)).toHaveLength(0);
  });

  it('is decorated action', async () => {
    expect(apply).toHaveProperty('wrapped');
  });

  it('handles if no presets', function () {
    const mockContext = {
      pineapple: 'delicious'
    };

    const expected = { ...mockContext };

    apply.wrapped(mockContext);
    expect(mockContext).toEqual(expected);
  });

  it('no changes if no preset createContext', function () {
    const mockContext = {
      presetInfos: [
        { name: 'one', module: null },
        { name: 'two', module: null }
      ],
      pineapple: 'yellow'
    };

    const expected = { ...mockContext };

    apply.wrapped(mockContext);
    expect(mockContext).toEqual(expected);
  });

  it('preset createContext added to context', function () {
    const mockContext = {
      presetInfos: [
        { name: 'one', module: { createContext: { apple: 'red' } } },
        { name: 'two', module: { createContext: { orange: 'orange' } } }
      ],
      pineapple: 'yellow'
    };

    apply.wrapped(mockContext);
    expect(mockContext).toHaveProperty('apple', 'red');
    expect(mockContext).toHaveProperty('orange', 'orange');
    expect(mockContext).toHaveProperty('pineapple', 'yellow');
  });

  it('preset createContext does not override existing context', function () {
    const mockContext = {
      presetInfos: [
        { name: 'one', module: { createContext: { apple: 'red' } } },
        { name: 'two', module: { createContext: { orange: 'orange' } } }
      ],
      pineapple: 'yellow',
      apple: 'pink'
    };

    apply.wrapped(mockContext);
    expect(mockContext).toHaveProperty('apple', 'pink');
    expect(mockContext).toHaveProperty('orange', 'orange');
    expect(mockContext).toHaveProperty('pineapple', 'yellow');
  });

  it('gathers createContext from extended presets', function () {
    const mockContext = {
      presetInfos: [
        { name: 'one', module: {}, presets: [
          { name: 'one-a', module: { createContext: { apple: 'blue', grape: 'purple' } } }
        ] },
        { name: 'two', module: { createContext: { orange: 'orange' } } }
      ],
      pineapple: 'yellow'
    };

    apply.wrapped(mockContext);
    expect(mockContext).toHaveProperty('apple', 'blue');
    expect(mockContext).toHaveProperty('orange', 'orange');
    expect(mockContext).toHaveProperty('grape', 'purple');
    expect(mockContext).toHaveProperty('pineapple', 'yellow');
  });

  it('extended presets do not override parent preset createContext', function () {
    const mockContext = {
      presetInfos: [
        { name: 'one', module: { createContext: { apple: 'red' } }, presets: [
          { name: 'one-a', module: { createContext: { apple: 'blue', grape: 'purple' } } }
        ] },
        { name: 'two', module: { createContext: { orange: 'orange' } } }
      ],
      pineapple: 'yellow'
    };

    apply.wrapped(mockContext);
    expect(mockContext).toHaveProperty('apple', 'red');
    expect(mockContext).toHaveProperty('orange', 'orange');
    expect(mockContext).toHaveProperty('grape', 'purple');
    expect(mockContext).toHaveProperty('pineapple', 'yellow');
  });
});
