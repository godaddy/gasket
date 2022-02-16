const promptHook = require('../lib/prompt');

describe('promptHook', () => {
  let mockGasket, mockCreateContext;

  beforeEach(function () {
    mockGasket = {};
    mockCreateContext = {};
  });

  it('adds reduxReducers to createContext', () => {
    const results = promptHook(mockGasket, mockCreateContext);
    expect(results).toHaveProperty('reduxReducers');
  });

  it('reduxReducers can add import statements', () => {
    const { reduxReducers } = promptHook(mockGasket, mockCreateContext);

    reduxReducers.addImport('const manyExampleReducer = require(\'@example/reducers\');');
    reduxReducers.addImport('const { singleExampleReducer } = require(\'@example/components\');');
    expect(reduxReducers.imports).toEqual(expect.stringContaining('manyExampleReducer'));
    expect(reduxReducers.imports).toEqual(expect.stringContaining('singleExampleReducer'));
  });

  it('reduxReducers can add entry statements', () => {
    const { reduxReducers } = promptHook(mockGasket, mockCreateContext);

    reduxReducers.addEntry('...manyExampleReducer');
    reduxReducers.addEntry('example: singleExampleReducer');
    expect(reduxReducers.entries).toEqual(expect.stringContaining('manyExampleReducer'));
    expect(reduxReducers.entries).toEqual(expect.stringContaining('singleExampleReducer'));
  });

  it('getters are own property', function () {
    /* eslint-disable no-prototype-builtins */
    const { reduxReducers } = promptHook(mockGasket, mockCreateContext);

    // this is on prototype, checking for test validation
    expect(reduxReducers.hasOwnProperty('addImport')).toBe(false);

    expect(reduxReducers.hasOwnProperty('imports')).toBe(true);
    expect(reduxReducers.hasOwnProperty('entries')).toBe(true);
    /* eslint-enable no-prototype-builtins */
  });

  it('reduxReducers.imports returns string with newlines', () => {
    const { reduxReducers } = promptHook(mockGasket, mockCreateContext);

    reduxReducers.addImport('const manyExampleReducer = require(\'@example/reducers\');');
    reduxReducers.addImport('const { singleExampleReducer } = require(\'@example/components\');');
    expect(reduxReducers.imports).toEqual(
      `const manyExampleReducer = require('@example/reducers');
const { singleExampleReducer } = require('@example/components');`
    );
  });

  it('reduxReducers.entires returns string with comma-separated newlines', () => {
    const { reduxReducers } = promptHook(mockGasket, mockCreateContext);

    reduxReducers.addEntry('...manyExampleReducer');
    reduxReducers.addEntry('example: singleExampleReducer');
    expect(reduxReducers.entries).toEqual(
      `  ...manyExampleReducer,
  example: singleExampleReducer`
    );
  });
});
