const path = require('path');
const proxyquire = require('proxyquire').noCallThru();
const sinon = require('sinon');
const assume = require('assume');

const defaultPlugins = require('../../../src/config/default-plugins');

const readDirStub = sinon.stub();
const tryRequireStub = sinon.stub().callsFake(mod => {
  if (mod === '/path/to/gasket.config') return { mockConfig: true };
  if (mod === '/path/to/bad/gasket.config') throw new Error('Error reading gasket.config');
  // if mod is missing
  return null;
});

const utils = proxyquire('../../../src/config/utils', {
  'util': { promisify: f => f },
  'fs': {
    readdir: readDirStub
  },
  '@gasket/utils': {
    tryRequire: tryRequireStub
  }
});

describe('config utils', () => {
  beforeEach(() => {
    sinon.resetHistory();
  });

  describe('getGasketConfig', () => {
    it('returns config object', async () => {
      const results = await utils.getGasketConfig({ root: '/path/to/app', config: '/path/to/gasket.config' });
      assume(results).an('object');
    });

    it('returns undefined if no config file found', async () => {
      const results = await utils.getGasketConfig({ root: '/path/to/app', config: '/path/to/missing/gasket.config' });
      assume(results).is.undefined;
    });

    it('adds root from flags to config', async () => {
      const results = await utils.getGasketConfig({ root: '/path/to/app', config: '/path/to/gasket.config' });
      assume(results).property('root', '/path/to/app');
    });

    it('adds default plugins', async () => {
      const results = await utils.getGasketConfig({ root: '/path/to/app', config: '/path/to/gasket.config' });
      assume(results.plugins.add).includes(defaultPlugins[0]);
    });

    it('adds user plugins', async () => {
      readDirStub.resolves(['app-plugin.js']);
      const results = await utils.getGasketConfig({ root: '/path/to/app', config: '/path/to/gasket.config' });
      assume(results.plugins.add).includes(path.join('/path/to/app', 'plugins', 'app-plugin'));
    });
  });

  describe('loadConfigFile', () => {
    it('uses config flag if absolute path', () => {
      utils.loadConfigFile({ config: '/path/to/gasket.config' });
      assume(tryRequireStub).calledWith('/path/to/gasket.config');
    });

    it('joins root with config if not absolute path', () => {
      utils.loadConfigFile({ root: '/path/to/app/', config: 'gasket.config' });
      assume(tryRequireStub).calledWith('/path/to/app/gasket.config');
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

    it('does not add default if user added', () => {
      const results = utils.addDefaultPlugins({ plugins: { add: ['@gasket/command-plugin'] } });
      assume(results.plugins.add).lengthOf(defaultPlugins.length);
      assume(results.plugins.add).includes('@gasket/command-plugin');
      assume(results.plugins.add).not.includes(defaultPlugins[0]);
    });

    it('does not add default if user added (short)', () => {
      const results = utils.addDefaultPlugins({ plugins: { add: ['command'] } });
      assume(results.plugins.add).lengthOf(defaultPlugins.length);
      assume(results.plugins.add).includes('command');
      assume(results.plugins.add).not.includes(defaultPlugins[0]);
    });

    it('does not add default if user removed', () => {
      const results = utils.addDefaultPlugins({ plugins: { remove: ['@gasket/command-plugin'] } });
      assume(results.plugins.add).lessThan(defaultPlugins.length);
      assume(results.plugins.add).not.includes(defaultPlugins[0]);
    });

    it('does not add default if user removed (short)', () => {
      const results = utils.addDefaultPlugins({ plugins: { remove: ['command'] } });
      assume(results.plugins.add).lessThan(defaultPlugins.length);
      assume(results.plugins.add).not.includes(defaultPlugins[0]);
    });
  });

  describe('addUserPlugins', () => {
    it('add javascript modules from the app\'s plugins dir', async () => {
      readDirStub.resolves(['app-plugin.js']);
      const results = await utils.addUserPlugins({ root: '/path/to/app' });
      assume(results.plugins.add).includes(path.join('/path/to/app', 'plugins', 'app-plugin'));
    });

    it('retains user configured plugins', async () => {
      readDirStub.resolves(['app-plugin.js']);
      const results = await utils.addUserPlugins({ root: '/path/to/app', plugins: { add: ['example'] } });
      assume(results.plugins.add).includes(path.join('/path/to/app', 'plugins', 'app-plugin'));
      assume(results.plugins.add).includes(path.join('example'));
    });

    it('ignores directory read errors', async () => {
      readDirStub.rejects(new Error('Bad things man'));
      const results = await utils.addUserPlugins({ root: '/path/to/app', plugins: { add: ['example'] } });
      assume(results.plugins.add).not.includes(path.join('/path/to/app', 'plugins', 'app-plugin'));
      assume(results.plugins.add).includes(path.join('example'));
    });

    it('ignores non-js files in plugins dir', async () => {
      readDirStub.resolves(['app-plugin.txt']);
      const results = await utils.addUserPlugins({ root: '/path/to/app' });
      assume(results.plugins.add).not.includes(path.join('/path/to/app', 'plugins', 'app-plugin'));
    });
  });
});
