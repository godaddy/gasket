const proxyquire = require('proxyquire').noCallThru();
const sinon = require('sinon');
const assume = require('assume');

const defaultPlugins = require('../../../src/config/default-plugins');

describe('config utils', () => {
  let flags, env, commandId;
  let mockGasketConfig, warnStub, readDirStub, statStub, utils;

  beforeEach(() => {
    flags = { root: '/path/to/app', config: '/path/to/gasket.config' };
    env = 'test-env';
    commandId = 'test-cmd';
    mockGasketConfig = { mockConfig: true };

    warnStub = sinon.stub();
    readDirStub = sinon.stub();
    statStub = sinon.stub().callsFake(mod => {
      if (mod === '/path/to/gasket.config.js' || mod === ' /path/to/app/gasket.config.js') return mockGasketConfig;
      if (mod === '/path/to/bad/gasket.config.js') return { mockConfig: true };
      if (mod === '/path/to/missing/gasket.config.js') throw new Error('No such file or directory');
    });

    utils = proxyquire('../../../src/config/utils', {
      'fs': {
        statSync: statStub,
        promises: {
          readdir: readDirStub
        }
      },
      '/path/to/gasket.config': mockGasketConfig,
      '/path/to/app/gasket.config': { mockConfig: true },
      '/path/to/bad/gasket.config': new Error('Bad gasket config')
    });
  });

  afterEach(function () {
    sinon.restore();
    delete process.env.NODE_ENV;
  });

  describe('getEnvironment', function () {
    it('returns env flag', function () {
      flags.env = env;
      const results = utils.getEnvironment(flags, commandId, warnStub);
      assume(results).equals(env);
    });

    it('returns local for local command', function () {
      const results = utils.getEnvironment(flags, 'local', warnStub);
      assume(results).equals('local');
    });

    it('returns NODE_ENV when no flag or local command', function () {
      process.env.NODE_ENV = 'fake';
      const results = utils.getEnvironment(flags, commandId, warnStub);
      assume(results).equals('fake');
    });

    it('warns for NODE_ENV when no flag or local command', function () {
      process.env.NODE_ENV = 'fake';
      utils.getEnvironment(flags, commandId, warnStub);
      assume(warnStub).calledWith('No env specified, falling back to NODE_ENV: "fake".');
    });

    it('returns development when no flag, NODE_ENV, or local command', function () {
      const results = utils.getEnvironment(flags, commandId, warnStub);
      assume(results).equals('development');
    });

    it('warns when no flag, NODE_ENV, or local command', function () {
      utils.getEnvironment(flags, commandId, warnStub);
      assume(warnStub).calledWith('No env specified, falling back to "development".');
    });
  });

  describe('addDefaultPlugins', () => {

    it('adds default plugins to config', () => {
      const results = utils.addDefaultPlugins({});
      assume(results).property('plugins');
      assume(results.plugins).property('add');
      assume(results.plugins.add).lengthOf(defaultPlugins.length);
      defaultPlugins.forEach(p => {
        assume(results.plugins.add).includes(p);
      });
    });

    it('retains user configured plugins', () => {
      const results = utils.addDefaultPlugins({ plugins: { add: ['example-plugin'] } });
      assume(results.plugins.add).greaterThan(defaultPlugins.length);
      defaultPlugins.concat('example-plugin').forEach(p => {
        assume(results.plugins.add).includes(p);
      });
    });

    it('does not add defaults if user added', () => {
      const results = utils.addDefaultPlugins({ plugins: { add: ['@gasket/plugin-command'] } });
      assume(results.plugins.add).lengthOf(defaultPlugins.length);
      assume(results.plugins.add).includes('@gasket/plugin-command');
      assume(results.plugins.add).not.includes(defaultPlugins[0]);
    });

    it('does not add defaults if user added (short)', () => {
      const results = utils.addDefaultPlugins({ plugins: { add: ['@gasket/command'] } });
      assume(results.plugins.add).lengthOf(defaultPlugins.length);
      assume(results.plugins.add).includes('@gasket/command');
      assume(results.plugins.add).not.includes(defaultPlugins[0]);
    });

    it('does not add defaults if user removed', () => {
      const results = utils.addDefaultPlugins({ plugins: { remove: ['@gasket/plugin-command'] } });
      assume(results.plugins.add).lessThan(defaultPlugins.length);
      assume(results.plugins.add).not.includes(defaultPlugins[0]);
    });

    it('does not add defaults if user removed (short)', () => {
      const results = utils.addDefaultPlugins({ plugins: { remove: ['@gasket/command'] } });
      assume(results.plugins.add).lessThan(defaultPlugins.length);
      assume(results.plugins.add).not.includes(defaultPlugins[0]);
    });
  });
});
