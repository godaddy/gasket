const fs = require('fs');
const { getReduxConfig } = require('./utils');
const rootPath = process.cwd();
const mockReduxOtherConfig = { test: 'test setting' };
const mockReduxConfig = { makeStore: './path/to/some-file.js' };

describe('Util', () => {
  let results, mockGasket;

  beforeEach(() => {
    mockGasket = {
      config: {
        root: rootPath
      }
    };
  });

  describe('getReduxConfig', () => {

    it('returns empty object if no redux settings', () => {
      results = getReduxConfig(mockGasket);
      expect(results).toEqual({});
    });

    it('returns base properties even if makeStore is not set', () => {
      mockGasket.config.redux = { ...mockReduxOtherConfig };
      results = getReduxConfig(mockGasket);
      expect(results).toEqual(mockReduxOtherConfig);
    });

    it('fixes makeStore path to absolute path', () => {
      mockGasket.config.redux = { ...mockReduxConfig };
      results = getReduxConfig(mockGasket);
      expect(results).toEqual({ makeStore: `${rootPath}/path/to/some-file.js` });
    });

    it('fixes makeStore path to absolute path and keeps other settings', () => {
      mockGasket.config.redux = { ...mockReduxOtherConfig, ...mockReduxConfig };
      results = getReduxConfig(mockGasket);
      expect(results).toHaveProperty('test', 'test setting');
      expect(results).toHaveProperty('makeStore', `${rootPath}/path/to/some-file.js`);
    });

    it('sets makeStore to expected file if in project root', () => {
      const spy = jest.spyOn(fs, 'existsSync').mockImplementation().mockReturnValue(true);
      results = getReduxConfig(mockGasket);
      expect(results).toHaveProperty('makeStore', `${rootPath}/store.js`);
      spy.mockReset();
      spy.mockRestore();
    });

    it('does not set makeStore if expected file not in project root', () => {
      const spy = jest.spyOn(fs, 'existsSync').mockImplementation().mockReturnValue(false);
      results = getReduxConfig(mockGasket);
      expect(results).toEqual({});
      spy.mockReset();
      spy.mockRestore();
    });
  });
});
