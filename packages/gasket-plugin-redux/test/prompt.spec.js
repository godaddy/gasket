const promptHook = require('../lib/prompt');

describe('promptHook', () => {
  let mockGasket, mockCreateContext, prompt, mockAnswers;

  beforeEach(function () {
    mockGasket = {};
    mockCreateContext = {};
    mockAnswers = { useRedux: true  };
    prompt = jest.fn().mockImplementation(() => mockAnswers);
  });

  it('adds reduxReducers to createContext', async () => {
    const results = await promptHook(mockGasket, mockCreateContext, { prompt });
    expect(results).toHaveProperty('reduxReducers');
  });

  it('reduxReducers can add import statements', async () => {
    const { reduxReducers } = await promptHook(mockGasket, mockCreateContext, { prompt });

    reduxReducers.addImport('const manyExampleReducer = require(\'@example/reducers\');');
    reduxReducers.addImport('const { singleExampleReducer } = require(\'@example/components\');');
    expect(reduxReducers.imports).toEqual(expect.stringContaining('manyExampleReducer'));
    expect(reduxReducers.imports).toEqual(expect.stringContaining('singleExampleReducer'));
  });

  it('reduxReducers can add entry statements', async () => {
    const { reduxReducers } = await promptHook(mockGasket, mockCreateContext, { prompt });

    reduxReducers.addEntry('...manyExampleReducer');
    reduxReducers.addEntry('example: singleExampleReducer');
    expect(reduxReducers.entries).toEqual(expect.stringContaining('manyExampleReducer'));
    expect(reduxReducers.entries).toEqual(expect.stringContaining('singleExampleReducer'));
  });

  it('getters are own property', async function () {
    /* eslint-disable no-prototype-builtins */
    const { reduxReducers } = await promptHook(mockGasket, mockCreateContext, { prompt });

    // this is on prototype, checking for test validation
    expect(reduxReducers.hasOwnProperty('addImport')).toBe(false);

    expect(reduxReducers.hasOwnProperty('imports')).toBe(true);
    expect(reduxReducers.hasOwnProperty('entries')).toBe(true);
    /* eslint-enable no-prototype-builtins */
  });

  it('reduxReducers.imports returns string with newlines', async () => {
    const { reduxReducers } = await promptHook(mockGasket, mockCreateContext, { prompt });

    reduxReducers.addImport('const manyExampleReducer = require(\'@example/reducers\');');
    reduxReducers.addImport('const { singleExampleReducer } = require(\'@example/components\');');
    expect(reduxReducers.imports).toEqual(
      `const manyExampleReducer = require('@example/reducers');
const { singleExampleReducer } = require('@example/components');`
    );
  });

  it('reduxReducers.entires returns string with comma-separated newlines', async () => {
    const { reduxReducers } = await promptHook(mockGasket, mockCreateContext, { prompt });

    reduxReducers.addEntry('...manyExampleReducer');
    reduxReducers.addEntry('example: singleExampleReducer');
    expect(reduxReducers.entries).toEqual(
      `  ...manyExampleReducer,
  example: singleExampleReducer`
    );
  });

  it('sets useRedux to true', async () => {
    const result = await promptHook(mockGasket, mockCreateContext, { prompt });
    expect(result.useRedux).toEqual(true);
  });

  it('sets useRedux to false', async () => {
    mockAnswers = { useRedux: false };
    const result = await promptHook(mockGasket, mockCreateContext, { prompt });
    expect(result.useRedux).toEqual(false);
  });

  it('does not add reduxReducers to createContext if useRedux is false', async () => {
    mockAnswers = { useRedux: false };
    const result = await promptHook(mockGasket, mockCreateContext, { prompt });
    expect(result).not.toHaveProperty('reduxReducers');
  });
});
