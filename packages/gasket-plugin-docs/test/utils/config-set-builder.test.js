/* eslint-disable max-nested-callbacks, max-len, max-statements */
const assume = require('assume');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const path = require('path');

const globStub = sinon.stub();
const DocsConfigSetBuilder = proxyquire('../../lib/utils/config-set-builder', {
  glob: globStub,
  util: {
    promisify: f => f
  }
});

const { docsSetupDefault } = DocsConfigSetBuilder;

const buildDocsConfigSpy = sinon.spy(DocsConfigSetBuilder.prototype, '_buildDocsConfig');

const mockGasket = {
  config: {
    root: '/path/to/app',
    docs: { outputDir: '.docs' }
  }
};

describe('utils - DocsConfigSetBuilder', () => {
  let instance;

  beforeEach(async () => {
    sinon.resetHistory();
    instance = new DocsConfigSetBuilder(mockGasket);
  });


  it('preps paths for config set', () => {
    const { config } = mockGasket;
    assume(instance._root).equals(config.root);
    assume(instance._docsRoot).equals(path.join(config.root, config.docs.outputDir));
  });

  describe('.addApp', () => {

    it('adds docConfig', async () => {
      const mockAppInfo = {};
      assume(instance._app).not.exists();
      await instance.addApp(mockAppInfo);
      assume(instance._app).exists();
    });

    it('does not re-add docConfig', async () => {
      await instance.addApp({ name: 'app-one' });
      await instance.addApp({ name: 'app-two' });
      assume(buildDocsConfigSpy).called(1);
      assume(buildDocsConfigSpy).calledWith({ name: 'app-one' });
      assume(buildDocsConfigSpy).not.calledWith({ name: 'app-two' });
    });

    it('uses custom docsSetup', async () => {
      const docsSetup = { custom: true };
      await instance.addApp({ name: 'app-one' }, docsSetup);
      assume(buildDocsConfigSpy).calledWithMatch(sinon.match.object, docsSetup);
    });

    it('finds docsSetup from package.json', async () => {
      const docsSetup = { custom: true };
      await instance.addApp({ name: 'app-one', package: { gasket: { docsSetup } } });
      assume(buildDocsConfigSpy).calledWithMatch(sinon.match.object, docsSetup);
    });

    it('uses default docsSetup if not passed', async () => {
      await instance.addApp({ name: 'app-one' });
      assume(buildDocsConfigSpy).calledWithMatch(sinon.match.object, docsSetupDefault);
    });

    it('adds targetRoot to overrides', async () => {
      await instance.addApp({ name: 'app-one' });
      assume(buildDocsConfigSpy).calledWithMatch(sinon.match.object, sinon.match.object, {
        targetRoot: path.join(instance._docsRoot, 'app')
      });
    });
  });

  describe('.addPlugin', () => {

    it('adds docConfig', async () => {
      assume(instance._plugins).lengthOf(0);
      await instance.addPlugin({ name: 'example-plugin' });
      assume(instance._plugins).lengthOf(1);
    });

    it('does not re-add docConfig', async () => {
      const mockInfo = { name: 'example-plugin' };
      await instance.addPlugin(mockInfo);
      await instance.addPlugin(mockInfo);
      assume(buildDocsConfigSpy).called(1);
      assume(buildDocsConfigSpy).calledWith(mockInfo);
    });

    it('uses default docsSetup if not passed', async () => {
      await instance.addPlugin({ name: 'example-plugin' });
      assume(buildDocsConfigSpy).calledWithMatch(sinon.match.object, docsSetupDefault);
    });

    it('accepts custom docsSetup', async () => {
      const mockDocSetup = { link: 'BOGUS.md' };
      await instance.addPlugin({ name: 'example-plugin' }, mockDocSetup);
      assume(buildDocsConfigSpy).calledWithMatch(sinon.match.object, mockDocSetup);
    });

    it('finds docsSetup from package.json', async () => {
      const docsSetup = { custom: true };
      await instance.addPlugin({ name: 'example-plugin', package: { gasket: { docsSetup } } });
      assume(buildDocsConfigSpy).calledWithMatch(sinon.match.object, docsSetup);
    });

    it('adds targetRoot to overrides', async () => {
      await instance.addPlugin({ name: '@some/example-plugin' });
      assume(buildDocsConfigSpy).calledWithMatch(sinon.match.object, sinon.match.object, {
        targetRoot: path.join(instance._docsRoot, 'plugins', '@some', 'example-plugin')
      });
    });

    it('add docsSetup for modules', async () => {
      const mockDocSetup = { link: 'BOGUS.md', modules: { fake: { link: 'BOGUS.md' } } };
      const spy = sinon.spy(instance, '_addModuleDocsSetup');
      await instance.addPlugin({ name: 'example-plugin' }, mockDocSetup);
      assume(spy).calledWithMatch({ fake: { link: 'BOGUS.md' } });
    });

    it('does not pass docsSetup for modules to builder', async () => {
      const mockDocSetup = { link: 'BOGUS.md', modules: { fake: { link: 'BOGUS.md' } } };
      await instance.addPlugin({ name: 'example-plugin' }, mockDocSetup);
      assume(buildDocsConfigSpy).not.calledWithMatch(sinon.match.object, mockDocSetup);
      assume(buildDocsConfigSpy).calledWithMatch(sinon.match.object, { link: 'BOGUS.md' });
    });

    describe('app plugins', () => {

      it('targetRoot shared with app', async () => {
        await instance.addPlugin({ name: '/path/to/app/plugins/example-plugin' });
        assume(buildDocsConfigSpy).calledWithMatch(sinon.match.object, sinon.match.object, {
          targetRoot: path.join(instance._docsRoot, 'app')
        });
      });

      it('adds sourceRoot of app package to overrides', async () => {
        await instance.addPlugin({ name: '/path/to/app/plugins/example-plugin' });
        assume(buildDocsConfigSpy).calledWithMatch(sinon.match.object, sinon.match.object, {
          sourceRoot: path.join(instance._root)
        });
      });

      it('adds nice name to overrides', async () => {
        await instance.addPlugin({ name: '/path/to/app/plugins/example-plugin' });
        assume(buildDocsConfigSpy).calledWithMatch(sinon.match.object, sinon.match.object, {
          name: 'plugins/example-plugin'
        });
      });
    });
  });

  describe('.addPlugins', () => {

    it('adds multiple plugins', async () => {
      await instance.addPlugins([
        { name: 'example-plugin' },
        { name: '@two/example-plugin' },
        { name: '@three/example-plugin' }
      ]);
      assume(instance._plugins).lengthOf(3);
    });
  });

  describe('.addPreset', () => {

    it('adds docConfig', async () => {
      assume(instance._presets).lengthOf(0);
      await instance.addPreset({ name: 'example-preset' });
      assume(instance._presets).lengthOf(1);
    });

    it('does not re-add docConfig', async () => {
      const mockInfo = { name: 'example-preset' };
      await instance.addPreset(mockInfo);
      await instance.addPreset(mockInfo);
      assume(buildDocsConfigSpy).called(1);
      assume(buildDocsConfigSpy).calledWith(mockInfo);
    });

    it('uses default docsSetup if not set', async () => {
      await instance.addPreset({ name: 'example-preset' });
      assume(buildDocsConfigSpy).calledWithMatch(sinon.match.object, docsSetupDefault);
    });

    it('accepts custom docsSetup', async () => {
      const mockDocSetup = { link: 'BOGUS.md' };
      await instance.addPreset({ name: 'example-preset' }, mockDocSetup);
      assume(buildDocsConfigSpy).calledWithMatch(sinon.match.object, mockDocSetup);
    });

    it('finds docsSetup from package.json', async () => {
      const docsSetup = { custom: true };
      await instance.addPreset({ name: 'example-preset', package: { gasket: { docsSetup } } });
      assume(buildDocsConfigSpy).calledWithMatch(sinon.match.object, docsSetup);
    });

    it('uses preset-defined docsSetup', async () => {
      const presetDocSetup = { link: 'BOGUS.md' };
      await instance.addPreset({ name: 'example-preset', module: { docsSetup: presetDocSetup } });
      assume(buildDocsConfigSpy).calledWithMatch(sinon.match.object, presetDocSetup);
    });

    it('prefers custom docsSetup over preset-defined', async () => {
      const mockDocSetup = { link: 'BOGUS.md' };
      const presetDocSetup = { link: 'OTHER.md' };
      await instance.addPreset({ name: 'example-preset', module: { docsSetup: presetDocSetup } }, mockDocSetup);
      assume(buildDocsConfigSpy).not.calledWithMatch(sinon.match.object, presetDocSetup);
      assume(buildDocsConfigSpy).calledWithMatch(sinon.match.object, mockDocSetup);
    });

    it('adds targetRoot to overrides', async () => {
      await instance.addPreset({ name: '@some/example-preset' });
      assume(buildDocsConfigSpy).calledWithMatch(sinon.match.object, sinon.match.object, {
        targetRoot: path.join(instance._docsRoot, 'presets', '@some', 'example-preset')
      });
    });
  });

  describe('.addPresets', () => {

    it('adds multiple presets', async () => {
      await instance.addPresets([
        { name: 'example-preset' },
        { name: '@two/example-preset' },
        { name: '@three/example-preset' }
      ]);
      assume(instance._presets).lengthOf(3);
    });
  });

  describe('.addModule', () => {

    it('adds docConfig', async () => {
      assume(instance._modules).lengthOf(0);
      await instance.addModule({ name: 'example-module' });
      assume(instance._modules).lengthOf(1);
    });

    it('does not re-add docConfig', async () => {
      const mockInfo = { name: 'example-module' };
      await instance.addModule(mockInfo);
      await instance.addModule(mockInfo);
      assume(buildDocsConfigSpy).called(1);
      assume(buildDocsConfigSpy).calledWith(mockInfo);
    });

    it('does NOT use default docsSetup if not passed', async () => {
      await instance.addModule({ name: 'example-module' });
      assume(buildDocsConfigSpy).not.calledWith(sinon.match.object, docsSetupDefault);
      assume(buildDocsConfigSpy).calledWith(sinon.match.object, {});
    });

    it('uses docsSetup if added by plugins', async () => {
      const mockSetup = { link: 'BOGUS.md' };
      instance._addModuleDocsSetup({ 'example-module': mockSetup });
      await instance.addModule({ name: 'example-module' });
      assume(buildDocsConfigSpy).calledWith(sinon.match.object, mockSetup);
    });

    it('uses default docsSetup if not set for @gasket modules', async () => {
      await instance.addModule({ name: '@gasket/example' });
      assume(buildDocsConfigSpy).calledWith(sinon.match.object, docsSetupDefault);
    });

    it('accepts custom docsSetup', async () => {
      const mockDocSetup = { link: 'BOGUS.md' };
      await instance.addModule({ name: 'example-module' }, mockDocSetup);
      assume(buildDocsConfigSpy).calledWith(sinon.match.object, mockDocSetup);
    });

    it('finds docsSetup from package.json', async () => {
      const docsSetup = { custom: true };
      await instance.addModule({ name: 'example-module', package: { gasket: { docsSetup } } });
      assume(buildDocsConfigSpy).calledWithMatch(sinon.match.object, docsSetup);
    });

    it('adds targetRoot to overrides', async () => {
      await instance.addModule({ name: '@some/example-module' });
      assume(buildDocsConfigSpy).calledWith(sinon.match.object, sinon.match.object, {
        targetRoot: path.join(instance._docsRoot, 'modules', '@some', 'example-module')
      });
    });
  });

  describe('.addModules', () => {

    it('adds multiple modules', async () => {
      await instance.addModules([
        { name: 'example-module' },
        { name: '@two/example-module' },
        { name: '@three/example-module' }
      ]);
      assume(instance._modules).lengthOf(3);
    });
  });

  describe('.getConfigSet', () => {

    it('returns an object with expected properties', async () => {
      const results = await instance.getConfigSet();
      const expected = [
        'app',
        'plugins',
        'presets',
        'modules',
        'root',
        'docsRoot',
        'transforms',
        'structures',
        'lifecycles',
        'guides',
        'commands'
      ];
      const actual = Object.keys(results);

      assume(actual).lengthOf(expected.length);
      expected.forEach(k => assume(actual).includes(k));
    });
  });

  describe('._flattenDetails', () => {
    beforeEach(async () => {
      await instance.addPlugins([{
        name: 'example-plugin',
        path: '/path/to/node_modules/example-plugin',
        commands: [{ name: 'example-command' }],
        structures: [{ name: 'example-structure' }],
        lifecycles: [{ name: 'example-lifecycle' }]
      }, {
        name: '@some/example-plugin',
        path: '/path/to/node_modules/@some/example-plugin',
        commands: [{ name: 'some-example-command' }],
        structures: [{ name: 'some-example-structure' }],
        lifecycles: [{ name: 'some-example-lifecycle' }]
      }]);
    });

    it('flattens subDocsConfigs from all plugins', async () => {
      const results = instance.getConfigSet();

      assume(results.commands).lengthOf(2);
      assume(results.structures).lengthOf(2);
      assume(results.lifecycles).lengthOf(2);
    });

    it('subDocsConfig includes "from" of parent plugin', async () => {
      const results = instance.getConfigSet();

      assume(results.commands[0]).property('from', 'example-plugin');
    });

    it('subDocsConfig includes sourceRoot of parent plugin', async () => {
      const results = instance.getConfigSet();

      assume(results.commands[0]).property('sourceRoot', '/path/to/node_modules/example-plugin');
    });

    it('subDocsConfig includes targetRoot of parent plugin', async () => {
      const results = instance.getConfigSet();

      assume(results.commands[0]).property('targetRoot', '/path/to/app/.docs/plugins/example-plugin');
    });
  });

  describe('._buildDocsConfig', () => {

    it('returns an object with expected properties', async () => {
      const mockInfo = {};
      const results = await instance._buildDocsConfig(mockInfo);

      const expected = [
        'name',
        'version',
        'description',
        'link',
        'sourceRoot',
        'transforms',
        'files',
        'metadata'
      ];
      const actual = Object.keys(results);

      assume(actual).lengthOf(expected.length);
      expected.forEach(k => assume(actual).includes(k));
    });

    it('"link" and "description" selection priority = overrides > moduleInfo > docsSetup > package', async () => {
      const overrides = { link: 'ONE', description: 'ONE' };
      const mockSetup = { link: 'THREE', description: 'THREE' };
      const mockInfo = { package: { homepage: 'FOUR', description: 'FOUR' }, path: 'path/to/app' };
      const fullMockInfo = { link: 'TWO', description: 'TWO', ...mockInfo };

      let results = await instance._buildDocsConfig(fullMockInfo, mockSetup, overrides);
      assume(results).property('link', 'ONE');
      assume(results).property('description', 'ONE');

      results = await instance._buildDocsConfig(fullMockInfo, mockSetup);
      assume(results).property('link', 'TWO');
      assume(results).property('description', 'TWO');

      results = await instance._buildDocsConfig(mockInfo, mockSetup);
      assume(results).property('link', 'THREE');
      assume(results).property('description', 'THREE');

      results = await instance._buildDocsConfig(mockInfo, {});
      assume(results).property('link', 'FOUR');
      assume(results).property('description', 'FOUR');
    });

    it('file "link" is set to null if no matching file added', async () => {
      const mockInfo = { package: {}, path: null };

      const results = await instance._buildDocsConfig(mockInfo);
      assume(results).property('link', null);
    });

    it('"name" and "sourceRoot" selection priority = overrides > moduleInfo', async () => {
      const mockInfo = { name: 'example-plugin', path: '/path/to/example-plugin' };
      const overrides = { name: 'different', sourceRoot: '/different/path' };

      let results = await instance._buildDocsConfig(mockInfo);
      assume(results).property('name', 'example-plugin');
      assume(results).property('sourceRoot', '/path/to/example-plugin');

      results = await instance._buildDocsConfig(mockInfo, {}, overrides);
      assume(results).property('name', 'different');
      assume(results).property('sourceRoot', '/different/path');
    });

    it('only returns local transforms', async () => {
      const mockInfo = {};
      const mockSetup = { transforms: [{ global: true }, {}] };

      const results = await instance._buildDocsConfig(mockInfo, mockSetup);
      assume(results.transforms).not.lengthOf(mockSetup.transforms.length);
      assume(results.transforms).lengthOf(1);
    });
  });

  describe('._segregateTransforms', () => {

    it('returns only local transforms', () => {
      const results = instance._segregateTransforms([{ global: true }, {}]);
      assume(results).lengthOf(1);
    });

    it('pushes global transforms to class property', () => {
      assume(instance._transforms).lengthOf(0);
      instance._segregateTransforms([{ global: true }, {}]);
      assume(instance._transforms).lengthOf(1);
      assume(instance._transforms[0]).property('global');
    });
  });

  describe('._addModuleDocsSetup', () => {

    it('adds docsSetup for a module key', () => {
      const mockSetup = { link: 'BOGUS.md' };
      assume(instance._moduleDocsSetups).not.property('fake');
      instance._addModuleDocsSetup({ fake: mockSetup });
      assume(instance._moduleDocsSetups).property('fake');
      assume(instance._moduleDocsSetups.fake).eqls(mockSetup);
    });

    it('merges existing docsSetup for a module', () => {
      const mockSetup = { link: 'BOGUS.md' };
      instance._addModuleDocsSetup({ fake: mockSetup });
      assume(instance._moduleDocsSetups.fake).property('link', 'BOGUS.md');
      assume(instance._moduleDocsSetups.fake).not.property('files');

      instance._addModuleDocsSetup({ fake: { link: 'DIFFERENT.md', files: ['extra-docs/**'] } });

      assume(instance._moduleDocsSetups.fake).not.eqls(mockSetup);
      // first in doesn't change
      assume(instance._moduleDocsSetups.fake).property('link', 'BOGUS.md');
      assume(instance._moduleDocsSetups.fake).property('files');
    });
  });

  describe('._findAllFiles', () => {
    const mockSourceRoot = '/path/to/example-module';

    it('adds file from link', async () => {
      const results = await instance._findAllFiles({}, {}, 'README.md', mockSourceRoot);
      assume(results).includes('README.md');
    });

    it('strips hash from link', async () => {
      const results = await instance._findAllFiles({}, {}, 'README.md#with-hash', mockSourceRoot);
      assume(results).includes('README.md');
    });

    it('ignores if no sourceRoot', async () => {
      const results = await instance._findAllFiles({}, {}, 'README.md#with-hash', null);
      assume(results).not.includes('README.md');
      assume(results).lengthOf(0);
    });

    it('does not add file if link is URL', async () => {
      const results = await instance._findAllFiles({}, {}, 'https://example.com', mockSourceRoot);
      assume(results).lengthOf(0);
    });

    it('does not add file if link is not set', async () => {
      const results = await instance._findAllFiles({}, {}, null, mockSourceRoot);
      assume(results).lengthOf(0);
    });

    it('looks up files of docsSetup from sourceRoot', async () => {
      const files = ['README.md', 'docs/**/*'];
      await instance._findAllFiles({}, { files }, null, mockSourceRoot);
      files.forEach(file => {
        assume(globStub).calledWith(file, { cwd: mockSourceRoot });
      });
    });

    it('adds files from resolved globs', async () => {
      const files = ['docs/**/*'];
      const expected = ['docs/ONE.md', 'docs/TWO.md', 'docs/THREE.md'];
      globStub.resolves(expected);
      const results = await instance._findAllFiles({}, { files }, null, mockSourceRoot);
      assume(results).eqls(expected);
    });

    it('files can be a single string (for safety)', async () => {
      const files = 'docs/**/*';
      const expected = ['docs/ONE.md', 'docs/TWO.md', 'docs/THREE.md'];
      const results = await instance._findAllFiles({}, { files }, null, mockSourceRoot);
      assume(globStub).calledWith(files);
      assume(results).eqls(expected);
    });

    it('includes files from from sub type links', async () => {
      const mockInfo = {
        lifecycles: [{
          link: 'LIFECYCLES.md'
        }],
        commands: [{
          link: 'docs/COMMANDS.md'
        }],
        structures: [{
          link: 'STRUCTURES.md#with-hash'
        }]
      };
      const results = await instance._findAllFiles(mockInfo, {}, null, mockSourceRoot);
      assume(results).includes('LIFECYCLES.md');
      assume(results).includes('STRUCTURES.md');
      assume(results).includes('docs/COMMANDS.md');
    });

    it('does not include duplicates files, ignoring hash', async () => {
      const mockInfo = {
        lifecycles: [{
          link: 'README.md#lifecycles'
        }],
        commands: [{
          link: 'README.md#commands'
        }],
        structures: [{
          link: 'README.md#structures'
        }]
      };
      const files = ['README.md'];
      globStub.resolves(['README.md']);
      const results = await instance._findAllFiles(mockInfo, { files }, 'README.md#with-hash', mockSourceRoot);
      assume(results).lengthOf(1);
      assume(results).includes('README.md');
    });
  });
});
