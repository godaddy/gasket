/* eslint-disable no-process-env */
const fs = require('fs');
const configureHook = require('./configure');
const rootPath = process.cwd();
const mockReduxOtherConfig = { test: 'test setting' };
const mockReduxConfig = { makeStore: './path/to/some-file.js' };

describe('configureHook', () => {
  let results, mockGasket, mockConfig;

  beforeEach(() => {
    mockConfig = {
      root: rootPath
    };
    mockGasket = {
      config: mockConfig
    };
  });

  afterEach(() => {
    delete process.env.GASKET_MAKE_STORE_FILE;
  });

  it('returns base config', () => {
    results = configureHook(mockGasket, mockConfig);
    expect(results).toEqual(expect.objectContaining(mockConfig));
  });

  it('returns empty object if no redux settings', () => {
    results = configureHook(mockGasket, mockConfig);
    expect(results.redux).toEqual({});
  });

  it('returns base properties even if makeStore is not set', () => {
    mockGasket.config.redux = { ...mockReduxOtherConfig };
    results = configureHook(mockGasket, mockConfig);
    expect(results.redux).toEqual(mockReduxOtherConfig);
  });

  it('fixes makeStore path to absolute path', () => {
    mockGasket.config.redux = { ...mockReduxConfig };
    results = configureHook(mockGasket, mockConfig);
    expect(results.redux).toEqual({ makeStore: `${ rootPath }/path/to/some-file.js` });
  });

  it('fixes makeStore path to absolute path and keeps other settings', () => {
    mockGasket.config.redux = { ...mockReduxOtherConfig, ...mockReduxConfig };
    results = configureHook(mockGasket, mockConfig);
    expect(results.redux).toHaveProperty('test', 'test setting');
    expect(results.redux).toHaveProperty('makeStore', `${ rootPath }/path/to/some-file.js`);
  });

  it('sets makeStore to expected file if in project root', () => {
    const spy = jest.spyOn(fs, 'existsSync')
      .mockImplementation()
      .mockReturnValue(true);
    results = configureHook(mockGasket, mockConfig);
    expect(results.redux).toHaveProperty('makeStore', `${ rootPath }/redux/store.js`);
    spy.mockReset();
    spy.mockRestore();
  });

  it('sets makeStore to next expected file if in project root', () => {
    const spy = jest.spyOn(fs, 'existsSync')
      .mockImplementation()
      .mockReturnValue(true)
      .mockReturnValueOnce(false);
    results = configureHook(mockGasket, mockConfig);
    expect(results.redux).toHaveProperty('makeStore', `${ rootPath }/store.js`);
    spy.mockReset();
    spy.mockRestore();
  });

  it('sets process.env.GASKET_MAKE_STORE_FILE to makeStore path', () => {
    mockGasket.config.redux = { ...mockReduxConfig };
    expect(process.env.GASKET_MAKE_STORE_FILE).toBeUndefined();
    results = configureHook(mockGasket, mockConfig);
    expect(process.env.GASKET_MAKE_STORE_FILE).toEqual(`${ rootPath }/path/to/some-file.js`);
  });

  it('does not set makeStore if expected file not in project root', () => {
    const spy = jest.spyOn(fs, 'existsSync').mockImplementation().mockReturnValue(false);
    results = configureHook(mockGasket, mockConfig);
    expect(results.redux).toEqual({});
    spy.mockReset();
    spy.mockRestore();
  });
});
