const assume = require('assume');
const apply = require('../../../../src/scaffold/actions/apply-preset-config');

describe('applyPresetConfig', function () {
  it('should not override anything if there is not a create object', function () {
    const context = {};
    apply(context);
    assume(Object.keys(context)).has.length(0);
  });

  it('is decorated action', async () => {
    assume(apply).property('wrapped');
  });

  it('handles if no presets', function () {
    const mockContext = {
      pineapple: 'delicious'
    };

    const expected = { ...mockContext };

    apply.wrapped(mockContext);
    assume(mockContext).eqls(expected);
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
    assume(mockContext).eqls(expected);
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
    assume(mockContext).property('apple', 'red');
    assume(mockContext).property('orange', 'orange');
    assume(mockContext).property('pineapple', 'yellow');
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
    assume(mockContext).property('apple', 'pink');
    assume(mockContext).property('orange', 'orange');
    assume(mockContext).property('pineapple', 'yellow');
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
    assume(mockContext).property('apple', 'blue');
    assume(mockContext).property('orange', 'orange');
    assume(mockContext).property('grape', 'purple');
    assume(mockContext).property('pineapple', 'yellow');
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
    assume(mockContext).property('apple', 'red');
    assume(mockContext).property('orange', 'orange');
    assume(mockContext).property('grape', 'purple');
    assume(mockContext).property('pineapple', 'yellow');
  });
});
