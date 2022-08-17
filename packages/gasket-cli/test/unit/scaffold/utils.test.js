const sinon = require('sinon');
const assume = require('assume');
const path = require('path');
const { pluginIdentifier } = require('@gasket/resolve');

const {
  addPluginsToContext,
  addPluginsToPkg,
  getPluginsWithVersions,
  ensureAbsolute,
  readConfig
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
      addPluginsToContext(['@gasket/jest', 'gasket-plugin-core'], mockContext);
      assume(mockContext.rawPlugins).eqls([
        '@gasket/jest', 'gasket-plugin-core'
      ]);
    });

    it('adds rawPlugins to existing context', () => {
      mockContext.rawPlugins = ['some-gasket-plugin'];
      addPluginsToContext(['@gasket/jest', 'gasket-plugin-core@1.2.3'], mockContext);
      assume(mockContext.rawPlugins).eqls([
        'some-gasket-plugin', '@gasket/jest', 'gasket-plugin-core@1.2.3'
      ]);
    });

    it('dedups rawPlugins plugins maintaining order and preferring those with version', () => {
      mockContext.rawPlugins = ['core', 'zebra', 'alpha'];
      addPluginsToContext(['@gasket/jest', 'gasket-plugin-core@1.2.3'], mockContext);
      assume(mockContext.rawPlugins).eqls([
        'gasket-plugin-core@1.2.3', 'zebra', 'alpha', '@gasket/jest'
      ]);
    });

    it('adds short plugins to context', () => {
      addPluginsToContext(['@gasket/jest', 'gasket-plugin-core@1.2.3'], mockContext);
      assume(mockContext.plugins).eqls([
        '@gasket/jest', 'core'
      ]);
    });

    it('adds short plugins to existing context', () => {
      mockContext.plugins = ['some-gasket-plugin'];
      addPluginsToContext(['@gasket/jest', 'gasket-plugin-core@1.2.3'], mockContext);
      assume(mockContext.plugins).eqls([
        'some-gasket-plugin', '@gasket/jest', 'core'
      ]);
    });

    it('dedups short plugins maintaining order', () => {
      mockContext.plugins = ['core', 'zebra', 'alpha'];
      addPluginsToContext(['@gasket/jest', 'alpha', 'gasket-plugin-core@1.2.3'], mockContext);
      assume(mockContext.plugins).eqls([
        'core', 'zebra', 'alpha', '@gasket/jest'
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
      addPluginsToPkg(['@gasket/jest', '@gasket/plugin-intl'], pkgStub);
      assume(pkgStub.add.args[0][1]).eqls({
        '@gasket/plugin-jest': 'latest',
        '@gasket/plugin-intl': 'latest'
      });
    });

    it('expands short plugin names', () => {
      addPluginsToPkg(['@gasket/jest', '@gasket/intl'], pkgStub);
      assume(pkgStub.add.args[0][1]).eqls({
        '@gasket/plugin-jest': 'latest',
        '@gasket/plugin-intl': 'latest'
      });
    });

    it('uses version of set by plugin identifier', () => {
      addPluginsToPkg(['@gasket/jest@3.2.1', '@gasket/plugin-intl@^1.2.3'], pkgStub);
      assume(pkgStub.add.args[0][1]).eqls({
        '@gasket/plugin-jest': '3.2.1',
        '@gasket/plugin-intl': '^1.2.3'
      });
    });

    it('accepts pluginIdentifiers instances', () => {
      const names = ['@gasket/jest', '@gasket/plugin-intl'];
      addPluginsToPkg(names.map(p => pluginIdentifier(p).withVersion('fake')), pkgStub);
      assume(pkgStub.add.args[0][1]).eqls({
        '@gasket/plugin-jest': 'fake',
        '@gasket/plugin-intl': 'fake'
      });
    });
  });

  describe('getPluginsWithVersions', () => {
    let pkgManagerStub;

    beforeEach(() => {
      pkgManagerStub = {
        info: sinon.stub().callsFake(() => ({ data: '7.8.9-faked' }))
      };
    });

    it('looks up latest version on registry if not set', async () => {
      const names = ['@gasket/jest', '@gasket/plugin-intl'];
      const results = await getPluginsWithVersions(names, pkgManagerStub);

      assume(pkgManagerStub.info).called(2);

      assume(results.map(o => o.full)).eqls([
        '@gasket/plugin-jest@^7.8.9-faked',
        '@gasket/plugin-intl@^7.8.9-faked'
      ]);
    });

    it('expands short plugin names', async () => {
      const names = ['@gasket/jest', '@gasket/intl'];
      const results = await getPluginsWithVersions(names, pkgManagerStub);
      assume(results.map(o => o.full)).eqls([
        '@gasket/plugin-jest@^7.8.9-faked',
        '@gasket/plugin-intl@^7.8.9-faked'
      ]);
    });

    it('uses version of set by plugin identifier', async () => {
      const names = ['@gasket/jest@3.2.1', '@gasket/plugin-intl@^1.2.3'];
      const results = await getPluginsWithVersions(names, pkgManagerStub);
      assume(results.map(o => o.full)).eqls([
        '@gasket/plugin-jest@3.2.1',
        '@gasket/plugin-intl@^1.2.3'
      ]);
    });

    it('accepts pluginIdentifiers instances', async () => {
      const names = ['@gasket/jest@3.2.1', '@gasket/plugin-intl'];
      const results = await getPluginsWithVersions(names.map(p => pluginIdentifier(p)), pkgManagerStub);
      assume(results.map(o => o.full)).eqls([
        '@gasket/plugin-jest@3.2.1',
        '@gasket/plugin-intl@^7.8.9-faked'
      ]);
    });
  });

  describe('ensureAbsolute', () => {

    it('transforms tildy paths to absolute', () => {
      const filepath = '~/.my-file';
      const result = ensureAbsolute(filepath);
      assume(path.isAbsolute(result)).true();
      assume(result).not.includes('~');
    });

    it('transforms relative paths to absolute', () => {
      const filepath = '../.my-file';
      const result = ensureAbsolute(filepath);
      assume(path.isAbsolute(result)).true();
      assume(result).not.includes('..');
    });

    it('does not transform absolute path', () => {
      const filepath = '/path/to/.my-file';
      const result = ensureAbsolute(filepath);
      assume(path.isAbsolute(result)).true();
      assume(result).equal(filepath);
    });
  });

  describe('readConfig', () => {
    it('adds values from config JSON string to context', () => {
      const flags = { config: '{"appDescription":"A test app","packageManager":"npm","testSuite":"fake"}' };
      readConfig(mockContext, flags);
      assume(mockContext.testSuite).eqls('fake');
      assume(mockContext.appDescription).eqls('A test app');
      assume(mockContext.packageManager).eqls('npm');
    });

    it('adds values from configFile to context', () => {
      mockContext.cwd = './test/unit/commands';
      const flags = { configFile: './test-ci-config.json' };
      readConfig(mockContext, flags);
      assume(mockContext.testSuite).eqls('mocha');
      assume(mockContext.appDescription).eqls('A basic gasket app');
      assume(mockContext.packageManager).eqls('npm');
    });
    it('does not add to context if no configFile/config flag', () => {
      readConfig(mockContext, {});
      assume(mockContext).eqls({});
    });
  });
});
