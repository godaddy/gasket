const path = require('path');

const mockReadDir = jest.fn();
jest.mock('fs', () => {
  return {
    promises: {
      readdir: mockReadDir
    }
  };
});

const utils = require('../lib/config');

describe('config', () => {
  let env, commandId, root;

  beforeEach(() => {
    root = path.join(__dirname, 'fixtures');
    env = 'development';
    commandId = 'test';
  });

  afterEach(function () {
    jest.resetAllMocks();
  });

  afterAll(function () {
    jest.restoreAllMocks();
  });

  describe('loadGasketConfigFile', () => {
    it('returns config object', async () => {
      const results = await utils.loadGasketConfigFile(root, env, commandId);
      expect(results).toBeInstanceOf(Object);
      expect(results).toEqual(expect.objectContaining({ mockConfig: true }));
    });

    it('returns undefined if no config file found', async () => {
      const results = await utils.loadGasketConfigFile(root, env, commandId, 'missing.gasket.config');
      expect(results).toBeUndefined();
    });

    it('throws for require errors', async () => {
      await expect(utils.loadGasketConfigFile(root, env, commandId, 'bad.gasket.config'))
        .rejects
        .toThrow(/Cannot find module 'some-fake-lib'/);
    });

    it('throws for malformed errors', async () => {
      await expect(utils.loadGasketConfigFile(root, env, commandId, 'malformed.gasket.config'))
        .rejects
        .toThrow(/malformed is not defined/);
    });

    it('adds root from flags to config', async () => {
      const results = await utils.loadGasketConfigFile(root, env, commandId);
      expect(results).toHaveProperty('root', root);
    });

    it('supports custom config name', async () => {
      const results = await utils.loadGasketConfigFile(root, env, commandId, 'custom.gasket.config');
      expect(results).toEqual(expect.objectContaining({ custom: true }));
    });

    it('supports custom config relative path', async () => {
      const results = await utils.loadGasketConfigFile(root, env, commandId, './custom/gasket.config');
      expect(results).toHaveProperty('root', root);
      expect(results).toEqual(expect.objectContaining({ custom: true }));
    });

    it('supports custom config absolute path', async () => {
      const configFile = path.join(root, 'custom', 'gasket.config.js')
      const results = await utils.loadGasketConfigFile('/somewhere', env, commandId, configFile);
      expect(results).toHaveProperty('root', '/somewhere');
      expect(results).toEqual(expect.objectContaining({ custom: true }));
    });

    // overrides are thoroughly tested in @gasket/utils - we are just checking
    // that the arguments are being passed through as expected
    describe('overrides', function () {
      it('applies env overrides', async () => {
        const baseResults = await utils.loadGasketConfigFile(root, env, commandId);
        expect(baseResults).toHaveProperty('example', 'base');
        const overrideResults = await utils.loadGasketConfigFile(root, 'other-env', commandId);
        expect(overrideResults).toHaveProperty('example', 'overridden from env');
      });

      it('applies command overrides', async () => {
        const baseResults = await utils.loadGasketConfigFile(root, env, commandId);
        expect(baseResults).toHaveProperty('example', 'base');
        const overrideResults = await utils.loadGasketConfigFile(root, env, 'other-cmd');
        expect(overrideResults).toHaveProperty('example', 'overridden from cmd');
      });
    });

    it('adds user plugins', async () => {
      mockReadDir.mockResolvedValueOnce(['app-plugin.js']);
      const results = await utils.loadGasketConfigFile(root, env, commandId);
      expect(results.plugins.add).toContain(path.join(root, 'plugins', 'app-plugin.js'));
    });
  });

  describe('addUserPlugins', () => {
    it('add javascript modules from the app\'s plugins dir', async () => {
      mockReadDir.mockResolvedValueOnce(['app-plugin.js']);
      const results = await utils.addUserPlugins({ root: '/path/to/app' });
      expect(results.plugins.add).toContain(path.join('/path/to/app', 'plugins', 'app-plugin.js'));
      expect(results.plugins.add).not.toContain(path.join('/path/to/app', 'src', 'plugins', 'app-plugin.js'));
    });

    it('add cjs modules from the app\'s plugins dir', async () => {
      mockReadDir.mockResolvedValueOnce(['app-plugin.cjs']);
      const results = await utils.addUserPlugins({ root: '/path/to/app' });
      expect(results.plugins.add).toContain(path.join('/path/to/app', 'plugins', 'app-plugin.cjs'));
      expect(results.plugins.add).not.toContain(path.join('/path/to/app', 'src', 'plugins', 'app-plugin.cjs'));
    });

    it('add javascript modules from the /src/plugins dir', async () => {
      mockReadDir
        .mockResolvedValueOnce()
        .mockResolvedValueOnce(['app-plugin.js']);
      const results = await utils.addUserPlugins({ root: '/path/to/app' });
      expect(results.plugins.add).not.toContain(path.join('/path/to/app', 'plugins', 'app-plugin'));
      expect(results.plugins.add).toContain(path.join('/path/to/app', 'src', 'plugins', 'app-plugin.js'));
    });

    it('add javascript modules from the both /plugins and /src/plugins dir', async () => {
      mockReadDir
        .mockResolvedValueOnce(['app-plugin-in-root.js'])
        .mockResolvedValueOnce(['app-plugin-in-src.js']);
      const results = await utils.addUserPlugins({ root: '/path/to/app' });
      expect(results.plugins.add).toContain(path.join('/path/to/app', 'plugins', 'app-plugin-in-root.js'));
      expect(results.plugins.add).toContain(path.join('/path/to/app', 'src', 'plugins', 'app-plugin-in-src.js'));
    });

    it('retains user configured plugins', async () => {
      mockReadDir.mockResolvedValueOnce(['app-plugin.js']);
      const results = await utils.addUserPlugins({ root: '/path/to/app', plugins: { add: ['example'] } });
      expect(results.plugins.add).toContain(path.join('/path/to/app', 'plugins', 'app-plugin.js'));
      expect(results.plugins.add).toContain(path.join('example'));
    });

    it('ignores missing dir errors', async () => {
      mockReadDir.mockRejectedValue({ code: 'ENOENT' });
      const results = await utils.addUserPlugins({ root: '/path/to/app', plugins: { add: ['example'] } });
      expect(results.plugins.add).not.toContain(path.join('/path/to/app', 'plugins', 'app-plugin'));
      expect(results.plugins.add).toContain(path.join('example'));
    });

    it('throws for any other read error', async () => {
      const error = new Error('BAD THINGS MAN');
      mockReadDir.mockRejectedValue(error);
      await expect(
        utils.addUserPlugins({ root: '/path/to/app', plugins: { add: ['example'] } })
      ).rejects.toThrow(error);
    });

    it('ignores non-js files in plugins dir', async () => {
      mockReadDir.mockResolvedValueOnce(['app-plugin.txt']);
      const results = await utils.addUserPlugins({ root: '/path/to/app' });
      expect(results.plugins.add).not.toContain(path.join('/path/to/app', 'plugins', 'app-plugin'));
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
          loadConfigured: jest.fn(() => ({ presets: mockPresets }))
        }
      };
    });

    it('handles if no presets', function () {
      const expected = { pineapple: 'yellow' };

      utils.assignPresetConfig(mockGasket);
      expect(mockGasket.config).toEqual(expected);
    });

    it('no changes if no preset config', function () {
      mockPresets.push(
        { name: 'one', module: null },
        { name: 'two', module: null }
      );
      const expected = { pineapple: 'yellow' };

      utils.assignPresetConfig(mockGasket);
      expect(mockGasket.config).toEqual(expected);
    });

    it('preset config added to gasket.config', function () {
      mockPresets.push(
        { name: 'one', module: { config: { apple: 'red' } } },
        { name: 'two', module: { config: { orange: 'orange' } } }
      );

      utils.assignPresetConfig(mockGasket);
      expect(mockGasket.config).toHaveProperty('apple', 'red');
      expect(mockGasket.config).toHaveProperty('orange', 'orange');
      expect(mockGasket.config).toHaveProperty('pineapple', 'yellow');
    });

    it('preset config does not override existing gasket.config', function () {
      mockGasket.config.apple = 'pink';

      mockPresets.push(
        { name: 'one', module: { config: { apple: 'red' } } },
        { name: 'two', module: { config: { orange: 'orange' } } }
      );

      utils.assignPresetConfig(mockGasket);
      expect(mockGasket.config).toHaveProperty('apple', 'pink');
      expect(mockGasket.config).toHaveProperty('orange', 'orange');
      expect(mockGasket.config).toHaveProperty('pineapple', 'yellow');
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
      expect(mockGasket.config).toHaveProperty('apple', 'blue');
      expect(mockGasket.config).toHaveProperty('orange', 'orange');
      expect(mockGasket.config).toHaveProperty('grape', 'purple');
      expect(mockGasket.config).toHaveProperty('pineapple', 'yellow');
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
      expect(mockGasket.config).toHaveProperty('apple', 'red');
      expect(mockGasket.config).toHaveProperty('orange', 'orange');
      expect(mockGasket.config).toHaveProperty('grape', 'purple');
      expect(mockGasket.config).toHaveProperty('pineapple', 'yellow');
    });

    it('deep merges preset config with existing config', function () {
      mockGasket.config = { pineapple: { color: 'yellow', quantity: 1 } };
      mockPresets.push(
        {
          name: 'one', module: { config: { apple: { color: 'red', quantity: 2 } } }, presets: [
            {
              name: 'one-a',
              module: { config: { apple: { color: 'blue', weight: '100g' }, grape: { color: 'purple' } } }
            }
          ]
        },
        { name: 'two', module: { config: { pineapple: { quantity: 2, weight: '900g' } } } }
      );

      utils.assignPresetConfig(mockGasket);
      expect(mockGasket.config.apple).toEqual({ color: 'red', weight: '100g', quantity: 2 });
      expect(mockGasket.config.pineapple).toEqual({ color: 'yellow', weight: '900g', quantity: 1 });
      expect(mockGasket.config.grape).toEqual({ color: 'purple' });
    });

    it('does not blow away named classes present in the config', function () {
      class Avatar {
      }

      mockGasket.config = { aang: new Avatar() };

      utils.assignPresetConfig(mockGasket);
      expect(mockGasket.config.aang).toBeInstanceOf(Avatar);
    });
  });
});
