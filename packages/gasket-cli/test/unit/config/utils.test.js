const path = require('path');
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

  describe('getGasketConfig', () => {
    it('returns config object', async () => {
      const results = await utils.getGasketConfig(flags, env, commandId);
      assume(results).an('object');
    });

    it('returns undefined if no config file found', async () => {
      flags.config = '/path/to/missing/gasket.config';
      const results = await utils.getGasketConfig(flags, env, commandId);
      assume(results).is.undefined;
    });

    it('adds root from flags to config', async () => {
      const results = await utils.getGasketConfig(flags, env, commandId);
      assume(results).property('root', '/path/to/app');
    });

    it('adds default plugins', async () => {
      const results = await utils.getGasketConfig(flags, env, commandId);
      const adds = results.plugins.add.map(p => p.name);
      defaultPlugins.forEach(p => {
        assume(adds).includes(p.name);
      });
    });

    // overrides are thoroughly tested in @gasket/utils - we are just checking
    // that the arguments are being passed through as expected
    describe('overrides', function () {
      it('applies env overrides', async () => {
        mockGasketConfig.example = 'base';
        mockGasketConfig.environments = {
          'test-env': {
            example: 'overridden'
          }
        };
        const results = await utils.getGasketConfig(flags, env, commandId);
        assume(results).property('example', 'overridden');
      });

      it('applies command overrides', async () => {
        mockGasketConfig.example = 'base';
        mockGasketConfig.commands = {
          'test-cmd': {
            example: 'overridden'
          }
        };
        const results = await utils.getGasketConfig(flags, env, commandId);
        assume(results).property('example', 'overridden');
      });
    });

    it('adds user plugins', async () => {
      readDirStub.resolves(['app-plugin.js']);
      const results = await utils.getGasketConfig(flags, env, commandId);
      assume(results.plugins.add).includes(path.join('/path/to/app', 'plugins', 'app-plugin'));
    });
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

  describe('loadConfigFile', () => {
    it('uses config flag if absolute path', () => {
      utils.loadConfigFile({ config: '/path/to/gasket.config' });
      assume(statStub).calledWith('/path/to/gasket.config.js');
    });

    it('joins root with config if not absolute path', () => {
      utils.loadConfigFile({ root: '/path/to/app/', config: 'gasket.config' });
      assume(statStub).calledWith('/path/to/app/gasket.config.js');
    });

    it('errors if config is bad', () => {
      const err = utils.loadConfigFile({ config: '/path/to/bad/gasket.config' });
      assume(err instanceof Error).is.true();
      assume(err.message).eqls('Bad gasket config');
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

  describe('addUserPlugins', () => {
    it('add javascript modules from the app\'s plugins dir', async () => {
      readDirStub.onCall(0).resolves(['app-plugin.js']);
      const results = await utils.addUserPlugins({ root: '/path/to/app' });
      assume(results.plugins.add).includes(path.join('/path/to/app', 'plugins', 'app-plugin'));
      assume(results.plugins.add).not.includes(path.join('/path/to/app', 'src', 'plugins', 'app-plugin'));
    });

    it('add javascript modules from the /src/plugins dir', async () => {
      readDirStub.onCall(1).resolves(['app-plugin.js']);
      const results = await utils.addUserPlugins({ root: '/path/to/app' });
      assume(results.plugins.add).not.includes(path.join('/path/to/app', 'plugins', 'app-plugin'));
      assume(results.plugins.add).includes(path.join('/path/to/app', 'src', 'plugins', 'app-plugin'));
    });

    it('add javascript modules from the both /plugins and /src/plugins dir', async () => {
      readDirStub.onCall(0).resolves(['app-plugin-in-root.js']);
      readDirStub.onCall(1).resolves(['app-plugin-in-src.js']);
      const results = await utils.addUserPlugins({ root: '/path/to/app' });
      assume(results.plugins.add).includes(path.join('/path/to/app', 'plugins', 'app-plugin-in-root'));
      assume(results.plugins.add).includes(path.join('/path/to/app', 'src', 'plugins', 'app-plugin-in-src'));
    });

    it('retains user configured plugins', async () => {
      readDirStub.resolves(['app-plugin.js']);
      const results = await utils.addUserPlugins({ root: '/path/to/app', plugins: { add: ['example'] } });
      assume(results.plugins.add).includes(path.join('/path/to/app', 'plugins', 'app-plugin'));
      assume(results.plugins.add).includes(path.join('example'));
    });

    it('ignores missing dir errors', async () => {
      readDirStub.rejects({ code: 'ENOENT' });
      const results = await utils.addUserPlugins({ root: '/path/to/app', plugins: { add: ['example'] } });
      assume(results.plugins.add).not.includes(path.join('/path/to/app', 'plugins', 'app-plugin'));
      assume(results.plugins.add).includes(path.join('example'));
    });

    it('throws for any other read error', async () => {
      readDirStub.rejects(new Error('Bad things man'));
      const testFn = () => utils.addUserPlugins({ root: '/path/to/app', plugins: { add: ['example'] } });
      assume(testFn).to.throwAsync();
    });

    it('ignores non-js files in plugins dir', async () => {
      readDirStub.resolves(['app-plugin.txt']);
      const results = await utils.addUserPlugins({ root: '/path/to/app' });
      assume(results.plugins.add).not.includes(path.join('/path/to/app', 'plugins', 'app-plugin'));
    });
  });

  describe('assignPresetConfig', () => {
    let mockGasket, mockPresets;

    beforeEach(() => {
      mockPresets = [];

      mockGasket = {
        config: {
          pineapple: 'yellow'
        },
        loader: {
          loadConfigured: sinon.stub().returns({ presets: mockPresets })
        }
      };
    });

    it('handles if no presets', function () {
      const expected = { pineapple: 'yellow' };

      utils.assignPresetConfig(mockGasket);
      assume(mockGasket.config).eqls(expected);
    });

    it('no changes if no preset config', function () {
      mockPresets.push(
        { name: 'one', module: null },
        { name: 'two', module: null }
      );
      const expected = { pineapple: 'yellow' };

      utils.assignPresetConfig(mockGasket);
      assume(mockGasket.config).eqls(expected);
    });

    it('preset config added to gasket.config', function () {
      mockPresets.push(
        { name: 'one', module: { config: { apple: 'red' } } },
        { name: 'two', module: { config: { orange: 'orange' } } }
      );

      utils.assignPresetConfig(mockGasket);
      assume(mockGasket.config).property('apple', 'red');
      assume(mockGasket.config).property('orange', 'orange');
      assume(mockGasket.config).property('pineapple', 'yellow');
    });

    it('preset config does not override existing gasket.config', function () {
      mockGasket.config.apple = 'pink';

      mockPresets.push(
        { name: 'one', module: { config: { apple: 'red' } } },
        { name: 'two', module: { config: { orange: 'orange' } } }
      );

      utils.assignPresetConfig(mockGasket);
      assume(mockGasket.config).property('apple', 'pink');
      assume(mockGasket.config).property('orange', 'orange');
      assume(mockGasket.config).property('pineapple', 'yellow');
    });

    it('gathers config from extended presets', function () {
      mockPresets.push(
        {
          name: 'one', module: {}, presets: [
            { name: 'one-a', module: { config: { apple: 'blue', grape: 'purple' } } }
          ]
        },
        { name: 'two', module: { config: { orange: 'orange' } } }
      );

      utils.assignPresetConfig(mockGasket);
      assume(mockGasket.config).property('apple', 'blue');
      assume(mockGasket.config).property('orange', 'orange');
      assume(mockGasket.config).property('grape', 'purple');
      assume(mockGasket.config).property('pineapple', 'yellow');
    });

    it('extended presets do not override parent preset config', function () {
      mockPresets.push(
        {
          name: 'one', module: { config: { apple: 'red' } }, presets: [
            { name: 'one-a', module: { config: { apple: 'blue', grape: 'purple' } } }
          ]
        },
        { name: 'two', module: { config: { orange: 'orange' } } }
      );

      utils.assignPresetConfig(mockGasket);
      assume(mockGasket.config).property('apple', 'red');
      assume(mockGasket.config).property('orange', 'orange');
      assume(mockGasket.config).property('grape', 'purple');
      assume(mockGasket.config).property('pineapple', 'yellow');
    });

    it('deep merges preset config with existing config', function () {
      mockGasket.config = { pineapple: { color: 'yellow', quantity: 1 } };
      mockPresets.push(
        {
          name: 'one', module: { config: { apple: { color: 'red', quantity: 2 } } }, presets: [
            { name: 'one-a', module: { config: { apple: { color: 'blue', weight: '100g' }, grape: { color: 'purple' } } } }
          ]
        },
        { name: 'two', module: { config: { pineapple: { quantity: 2, weight: '900g' } } } }
      );

      utils.assignPresetConfig(mockGasket);
      assume(mockGasket.config.apple).eqls({ color: 'red', weight: '100g', quantity: 2 });
      assume(mockGasket.config.pineapple).eqls({ color: 'yellow', weight: '900g', quantity: 1 });
      assume(mockGasket.config.grape).eqls({ color: 'purple' });
    });

    it('does not blow away named classes present in the config', function () {
      class Avatar {
      }

      mockGasket.config = { aang: new Avatar() };

      utils.assignPresetConfig(mockGasket);
      assume(mockGasket.config.aang).is.instanceof(Avatar);
    });
  });
});
