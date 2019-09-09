const sinon = require('sinon');
const assume = require('assume');

const {
  addPluginsToContext,
  addPluginsToPkg,
  flattenPresets
} = require('../../../src/scaffold/utils');

describe('Utils', () => {
  let sandbox, mockContext;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    mockContext = {};
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('addPluginsToContext', () => {

    it('adds rawPlugins to context', () => {
      addPluginsToContext(['jest', '@gasket/core-plugin'], mockContext);
      assume(mockContext.rawPlugins).eqls([
        'jest', '@gasket/core-plugin'
      ]);
    });

    it('adds rawPlugins to existing context', () => {
      mockContext.rawPlugins = ['some-gasket-plugin'];
      addPluginsToContext(['jest', '@gasket/core-plugin@1.2.3'], mockContext);
      assume(mockContext.rawPlugins).eqls([
        'some-gasket-plugin', 'jest', '@gasket/core-plugin@1.2.3'
      ]);
    });

    it('dedups rawPlugins plugins maintaining order and preferring those with version', () => {
      mockContext.rawPlugins = ['core', 'zebra', 'alpha'];
      addPluginsToContext(['jest', '@gasket/core-plugin@1.2.3'], mockContext);
      assume(mockContext.rawPlugins).eqls([
        '@gasket/core-plugin@1.2.3', 'zebra', 'alpha', 'jest'
      ]);
    });

    it('adds short plugins to context', () => {
      addPluginsToContext(['jest', '@gasket/core-plugin@1.2.3'], mockContext);
      assume(mockContext.plugins).eqls([
        'jest', 'core'
      ]);
    });

    it('adds short plugins to existing context', () => {
      mockContext.plugins = ['some-gasket-plugin'];
      addPluginsToContext(['jest', '@gasket/core-plugin@1.2.3'], mockContext);
      assume(mockContext.plugins).eqls([
        'some-gasket-plugin', 'jest', 'core'
      ]);
    });

    it('dedups short plugins maintaining order', () => {
      mockContext.plugins = ['core', 'zebra', 'alpha'];
      addPluginsToContext(['jest', 'alpha', '@gasket/core-plugin@1.2.3'], mockContext);
      assume(mockContext.plugins).eqls([
        'core', 'zebra', 'alpha', 'jest'
      ]);
    });
  });

  describe('addPluginsToPkg', () => {
    let pkgStub;

    beforeEach(() => {
      pkgStub = {
        add: sandbox.stub()
      };
    });

    it('add plugins as dependencies to pkg', () => {
      addPluginsToPkg(['jest', '@gasket/intl-plugin'], pkgStub);
      assume(pkgStub.add.args[0][1]).eqls({
        '@gasket/jest-plugin': 'latest',
        '@gasket/intl-plugin': 'latest'
      });
    });

    it('expands short plugin names', () => {
      addPluginsToPkg(['jest', 'intl'], pkgStub);
      assume(pkgStub.add.args[0][1]).eqls({
        '@gasket/jest-plugin': 'latest',
        '@gasket/intl-plugin': 'latest'
      });
    });

    it('uses version of set by plugin identifier', () => {
      addPluginsToPkg(['jest@3.2.1', '@gasket/intl-plugin@^1.2.3'], pkgStub);
      assume(pkgStub.add.args[0][1]).eqls({
        '@gasket/jest-plugin': '3.2.1',
        '@gasket/intl-plugin': '^1.2.3'
      });
    });
  });

  describe('flattenPresets', () => {
    it('returns empty array if no presets', () => {
      const results = flattenPresets();
      assume(results).eqls([]);
    });

    it('returns same array if no extended presets', () => {
      const results = flattenPresets([
        { name: 'one' },
        { name: 'two', presets: [] }
      ]);
      assume(results).eqls([
        { name: 'one' },
        { name: 'two', presets: [] }
      ]);
    });

    it('flattens extended presets', () => {
      const results = flattenPresets([
        { name: 'one' },
        { name: 'two', presets: [
          { name: 'two-a' },
          { name: 'two-b', presets: [
            { name: 'two-b-1' },
            { name: 'two-b-2' }
          ]
          }
        ]
        }
      ]);
      assume(results.map(p => p.name)).eqls([
        'one', 'two', 'two-a', 'two-b', 'two-b-1', 'two-b-2'
      ]);
    });

    it('flattens presets ordered by depth as parents before children', () => {
      const results = flattenPresets([
        { name: 'one', presets: [
          { name: 'one-a' },
          { name: 'one-b', presets: [
            { name: 'one-b-1' },
            { name: 'one-b-2' }
          ]
          }
        ]
        },
        { name: 'two', presets: [
          { name: 'two-a' },
          { name: 'two-b', presets: [
            { name: 'two-b-1' },
            { name: 'two-b-2' }
          ]
          }
        ]
        }
      ]);
      assume(results.map(p => p.name)).eqls([
        'one', 'two', 'one-a', 'one-b', 'two-a', 'two-b', 'one-b-1', 'one-b-2', 'two-b-1', 'two-b-2'
      ]);
    });
  });
});
