const mockWarnStub = jest.fn();
const mockReadDirStub = jest.fn();
const mockStatStub = jest.fn().mockImplementation(mod => {
  if (mod === '/path/to/gasket.config.js' || mod === ' /path/to/app/gasket.config.js') return { mockConfig: true };
  if (mod === '/path/to/bad/gasket.config.js') return { mockConfig: true };
  if (mod === '/path/to/missing/gasket.config.js') throw new Error('No such file or directory');
});

jest.mock('fs', () => ({
  statSync: mockStatStub,
  promises: {
    readdir: mockReadDirStub
  }
}));

const utils = require('../../../src/config/utils');
const defaultPlugins = require('../../../src/config/default-plugins');

describe('config utils', () => {
  let flags, env, commandId;

  beforeEach(() => {
    flags = { root: '/path/to/app', config: '/path/to/gasket.config' };
    env = 'test-env';
    commandId = 'test-cmd';
  });

  afterEach(function () {
    jest.resetAllMocks();
    delete process.env.NODE_ENV;
  });

  describe('getEnvironment', function () {
    it('returns env flag', function () {
      flags.env = env;
      const results = utils.getEnvironment(flags, commandId, mockWarnStub);
      expect(results).toEqual(env);
    });

    it('returns local for local command', function () {
      const results = utils.getEnvironment(flags, 'local', mockWarnStub);
      expect(results).toEqual('local');
    });

    it('returns NODE_ENV when no flag or local command', function () {
      process.env.NODE_ENV = 'fake';
      const results = utils.getEnvironment(flags, commandId, mockWarnStub);
      expect(results).toEqual('fake');
    });

    it('warns for NODE_ENV when no flag or local command', function () {
      process.env.NODE_ENV = 'fake';
      utils.getEnvironment(flags, commandId, mockWarnStub);
      expect(mockWarnStub).toHaveBeenCalledWith('No env specified, falling back to NODE_ENV: "fake".');
    });

    it('returns development when no flag, NODE_ENV, or local command', function () {
      const results = utils.getEnvironment(flags, commandId, mockWarnStub);
      expect(results).toEqual('development');
    });

    it('warns when no flag, NODE_ENV, or local command', function () {
      utils.getEnvironment(flags, commandId, mockWarnStub);
      expect(mockWarnStub).toHaveBeenCalledWith('No env specified, falling back to "development".');
    });
  });

  describe('addDefaultPlugins', () => {

    it('adds default plugins to config', () => {
      const results = utils.addDefaultPlugins({});
      expect(results).toHaveProperty('plugins');
      expect(results.plugins).toHaveProperty('add');
      expect(results.plugins.add.length).toEqual(defaultPlugins.length);
      defaultPlugins.forEach(p => {
        expect(results.plugins.add).toContain(p);
      });
    });

    it('retains user configured plugins', () => {
      const results = utils.addDefaultPlugins({ plugins: { add: ['example-plugin'] } });
      expect(results.plugins.add.length).toBeGreaterThan(defaultPlugins.length);
      defaultPlugins.concat('example-plugin').forEach(p => {
        expect(results.plugins.add).toContain(p);
      });
    });

    it('does not add defaults if user added', () => {
      const results = utils.addDefaultPlugins({ plugins: { add: ['@gasket/plugin-command'] } });
      expect(results.plugins.add.length).toEqual(defaultPlugins.length);
      expect(results.plugins.add).toContain('@gasket/plugin-command');
      expect(results.plugins.add).not.toContain(defaultPlugins[0]);
    });

    it('does not add defaults if user added (short)', () => {
      const results = utils.addDefaultPlugins({ plugins: { add: ['@gasket/command'] } });
      expect(results.plugins.add.length).toEqual(defaultPlugins.length);
      expect(results.plugins.add).toContain('@gasket/command');
      expect(results.plugins.add).not.toContain(defaultPlugins[0]);
    });

    it('does not add defaults if user removed', () => {
      const results = utils.addDefaultPlugins({ plugins: { remove: ['@gasket/plugin-command'] } });
      expect(results.plugins.add.length).toBeLessThan(defaultPlugins.length);
      expect(results.plugins.add).not.toContain(defaultPlugins[0]);
    });

    it('does not add defaults if user removed (short)', () => {
      const results = utils.addDefaultPlugins({ plugins: { remove: ['@gasket/command'] } });
      expect(results.plugins.add.length).toBeLessThan(defaultPlugins.length);
      expect(results.plugins.add.length).not.toContain(defaultPlugins[0]);
    });
  });
});
