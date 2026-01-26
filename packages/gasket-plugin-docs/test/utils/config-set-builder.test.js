/* eslint-disable max-statements */
import { vi } from 'vitest';
import path from 'path';
import DocsConfigSetBuilder from '../../lib/utils/config-set-builder.js';
import { glob } from 'glob';

const fixtures = path.resolve(import.meta.dirname, '..', 'fixtures');
vi.mock('glob', () => ({ glob: vi.fn().mockResolvedValue(['./files/file-a.md', './files/file-b.md']) }));

describe('utils - DocsConfigSetBuilder', () => {
  let instance, buildDocsConfigSpy, mockGasket;

  beforeEach(async () => {
    mockGasket = {
      config: {
        root: '/path/to/app',
        docs: { outputDir: '.docs' }
      }
    };

    instance = new DocsConfigSetBuilder(mockGasket);
    buildDocsConfigSpy = vi.spyOn(instance, '_buildDocsConfig');
  });


  it('preps paths for config set', () => {
    const { config } = mockGasket;
    expect(instance._root).toEqual(config.root);
    expect(instance._docsRoot).toEqual(path.join(config.root, config.docs.outputDir));
  });

  describe('.addApp', () => {

    it('adds docConfig', async () => {
      const mockAppInfo = { metadata: { path: '/some/path' } };
      expect(instance._app).not.toBeTruthy();
      await instance.addApp(mockAppInfo);
      expect(instance._app).toBeTruthy();
    });

    it('does not re-add docConfig', async () => {
      await instance.addApp({ name: 'app-one', metadata: { path: '/some/path' } });
      await instance.addApp({ name: 'app-two', metadata: { path: '/some/path' } });
      expect(buildDocsConfigSpy).toHaveBeenCalledTimes(1);
      expect(buildDocsConfigSpy).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'app-one' }),
        expect.objectContaining({ files: ['docs/**/*.*', 'LICENSE.md'], link: 'README.md' }),
        expect.any(Object)
      );
      expect(buildDocsConfigSpy).not.toHaveBeenCalledWith({ name: 'app-two' });
    });

    it('uses custom docsSetup', async () => {
      const docsSetup = { custom: true };
      const moduleData = { name: 'app-one', metadata: { path: '/some/path' } };
      await instance.addApp(moduleData, docsSetup);
      expect(buildDocsConfigSpy).toHaveBeenCalledWith(
        expect.objectContaining(moduleData),
        expect.objectContaining(docsSetup),
        expect.any(Object)
      );
    });

    it('finds docsSetup from package.json', async () => {
      const docsSetup = { custom: true };
      const moduleData = {
        name: 'app-one',
        package: { gasket: { docsSetup } },
        metadata: { path: '/some/path' }
      };
      await instance.addApp(moduleData);
      expect(buildDocsConfigSpy).toHaveBeenCalledWith(
        expect.objectContaining(moduleData),
        expect.objectContaining(docsSetup),
        expect.any(Object)
      );
    });

    it('uses default docsSetup if not passed', async () => {
      const moduleData = { name: 'app-one', metadata: { path: '/some/path' } };
      await instance.addApp(moduleData);
      expect(buildDocsConfigSpy).toHaveBeenCalledWith(
        expect.objectContaining(moduleData),
        expect.objectContaining(DocsConfigSetBuilder.docsSetupDefault),
        expect.any(Object)
      );
    });

    it('adds targetRoot to overrides', async () => {
      const moduleData = { name: 'app-one', metadata: { path: '/some/path' } };
      await instance.addApp(moduleData);
      expect(buildDocsConfigSpy).toHaveBeenCalledWith(
        expect.objectContaining(moduleData),
        expect.any(Object),
        { targetRoot: path.join(instance._docsRoot, 'app') }
      );
    });
  });

  describe('.addPlugin', () => {

    it('adds docConfig', async () => {
      expect(instance._plugins).toHaveLength(0);
      await instance.addPlugin({ name: 'example-plugin', metadata: { path: '/some/path' } });
      expect(instance._plugins).toHaveLength(1);
    });

    it('does not re-add docConfig', async () => {
      const mockInfo = { name: 'example-plugin', metadata: { path: '/some/path' } };
      await instance.addPlugin(mockInfo);
      await instance.addPlugin(mockInfo);
      expect(buildDocsConfigSpy).toHaveBeenCalledTimes(1);
      expect(buildDocsConfigSpy).toHaveBeenCalledWith(mockInfo, expect.any(Object), expect.any(Object));
    });

    it('uses default docsSetup if not passed', async () => {
      const mockInfo = { name: 'example-plugin', metadata: { path: '/some/path' } };
      await instance.addPlugin(mockInfo);
      expect(buildDocsConfigSpy).toHaveBeenCalledWith(mockInfo, DocsConfigSetBuilder.docsSetupDefault, expect.any(Object));
    });

    it('accepts custom docsSetup', async () => {
      const mockDocSetup = { link: 'BOGUS.md' };
      const mockInfo = { name: 'example-plugin', metadata: { path: '/some/path' } };
      await instance.addPlugin(mockInfo, mockDocSetup);
      expect(buildDocsConfigSpy).toHaveBeenCalledWith(mockInfo, mockDocSetup, expect.any(Object));
    });

    it('finds docsSetup from package.json', async () => {
      const docsSetup = { custom: true };
      const mockInfo = { name: 'example-plugin', package: { gasket: { docsSetup } }, metadata: { path: '/some/path' } };
      await instance.addPlugin(mockInfo);
      expect(buildDocsConfigSpy).toHaveBeenLastCalledWith(mockInfo, docsSetup, expect.any(Object));
    });

    it('adds targetRoot to overrides', async () => {
      const mockInfo = { name: '@some/example-plugin', metadata: { path: '/some/path' } };
      await instance.addPlugin(mockInfo);
      expect(buildDocsConfigSpy).toHaveBeenCalledWith(
        mockInfo,
        expect.any(Object),
        expect.objectContaining({
          targetRoot: path.join(instance._docsRoot, 'plugins', '@some', 'example-plugin')
        })
      );
    });

    it('add docsSetup for modules', async () => {
      const mockDocSetup = { link: 'BOGUS.md', modules: { fake: { link: 'BOGUS.md' } } };
      const spy = vi.spyOn(instance, '_addModuleDocsSetup');
      await instance.addPlugin({ name: 'example-plugin', metadata: { path: '/some/path' } }, mockDocSetup);
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ fake: { link: 'BOGUS.md' } })
      );
    });

    it('does not pass docsSetup for modules to builder', async () => {
      const mockDocSetup = { link: 'BOGUS.md', modules: { fake: { link: 'BOGUS.md' } } };
      const mockInfo = { name: 'example-plugin', metadata: { path: '/some/path' } };
      await instance.addPlugin(mockInfo, mockDocSetup);
      expect(buildDocsConfigSpy).not.toHaveBeenCalledWith(mockInfo, mockDocSetup);
      expect(buildDocsConfigSpy).toHaveBeenCalledWith(
        mockInfo,
        expect.objectContaining({ link: 'BOGUS.md' }),
        expect.any(Object)
      );
    });

    describe('app plugins', () => {

      it('targetRoot shared with app', async () => {
        const mockInfo = { name: '/path/to/app/plugins/example-plugin', metadata: { path: '/some/path' } };
        await instance.addPlugin(mockInfo);
        expect(buildDocsConfigSpy).toHaveBeenCalledWith(
          mockInfo,
          expect.any(Object),
          expect.objectContaining({
            targetRoot: path.join(instance._docsRoot, 'app')
          })
        );
      });

      it('adds sourceRoot of app package to overrides', async () => {
        const mockInfo = { name: '/path/to/app/plugins/example-plugin', metadata: { path: '/some/path' } };
        await instance.addPlugin(mockInfo);
        expect(buildDocsConfigSpy).toHaveBeenCalledWith(
          mockInfo,
          expect.any(Object),
          expect.objectContaining({
            sourceRoot: path.join(instance._root)
          })
        );
      });

      it('adds nice name to overrides', async () => {
        const mockInfo = { name: '/path/to/app/plugins/example-plugin', metadata: { path: '/some/path' } };
        await instance.addPlugin(mockInfo);
        expect(buildDocsConfigSpy).toHaveBeenCalledWith(
          mockInfo,
          expect.any(Object),
          expect.objectContaining({
            name: 'plugins/example-plugin'
          })
        );
      });
    });
  });

  describe('.addPlugins', () => {

    it('adds multiple plugins', async () => {
      await instance.addPlugins([
        { name: 'example-plugin', metadata: { path: '/some/path' } },
        { name: '@two/example-plugin', metadata: { path: '/some/path' } },
        { name: '@three/example-plugin', metadata: { path: '/some/path' } }
      ]);
      expect(instance._plugins).toHaveLength(3);
    });
  });

  describe('.addModule', () => {

    it('adds docConfig', async () => {
      expect(instance._modules).toHaveLength(0);
      await instance.addModule({ name: 'example-module', metadata: { path: '/some/path' } });
      expect(instance._modules).toHaveLength(1);
    });

    it('does not re-add docConfig', async () => {
      const mockInfo = { name: 'example-module', metadata: { path: '/some/path' } };
      await instance.addModule(mockInfo);
      await instance.addModule(mockInfo);
      expect(buildDocsConfigSpy).toHaveBeenCalledTimes(1);
      expect(buildDocsConfigSpy).toHaveBeenCalledWith(
        mockInfo,
        expect.any(Object),
        expect.any(Object)
      );
    });

    it('does NOT use default docsSetup if not passed', async () => {
      await instance.addModule({ name: 'example-module', metadata: { path: '/some/path' } });
      expect(buildDocsConfigSpy).not.toHaveBeenCalledWith(expect.any(Object), DocsConfigSetBuilder.docsSetupDefault);
      expect(buildDocsConfigSpy).toHaveBeenCalledWith(
        expect.any(Object),
        {},
        expect.any(Object)
      );
    });

    it('uses docsSetup if added by plugins', async () => {
      const mockSetup = { link: 'BOGUS.md' };
      instance._addModuleDocsSetup({ 'example-module': mockSetup });
      await instance.addModule({ name: 'example-module', metadata: { path: '/some/path' } });
      expect(buildDocsConfigSpy).toHaveBeenCalledWith(
        expect.any(Object),
        mockSetup,
        expect.any(Object)
      );
    });

    it('uses default docsSetup if not set for @gasket modules', async () => {
      await instance.addModule({ name: '@gasket/example', metadata: { path: '/some/path' } });
      expect(buildDocsConfigSpy).toHaveBeenCalledWith(
        expect.any(Object),
        DocsConfigSetBuilder.docsSetupDefault,
        expect.any(Object)
      );
    });

    it('accepts custom docsSetup', async () => {
      const mockDocSetup = { link: 'BOGUS.md' };
      await instance.addModule({ name: 'example-module', metadata: { path: '/some/path' } }, mockDocSetup);
      expect(buildDocsConfigSpy).toHaveBeenCalledWith(
        expect.any(Object),
        mockDocSetup,
        expect.any(Object)
      );
    });

    it('finds docsSetup from package.json', async () => {
      const docsSetup = { custom: true };
      await instance.addModule({ name: 'example-module', package: { gasket: { docsSetup } }, metadata: { path: '/some/path' } });
      expect(buildDocsConfigSpy).toHaveBeenCalledWith(
        expect.any(Object),
        docsSetup,
        expect.any(Object)
      );
    });

    it('adds targetRoot to overrides', async () => {
      await instance.addModule({ name: '@some/example-module', metadata: { path: '/some/path' } });
      expect(buildDocsConfigSpy).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        expect.objectContaining({
          targetRoot: path.join(instance._docsRoot, 'modules', '@some', 'example-module')
        })
      );
    });
  });

  describe('.addModules', () => {

    it('adds multiple modules', async () => {
      await instance.addModules([
        { name: 'example-module', metadata: { path: '/some/path' } },
        { name: '@two/example-module', metadata: { path: '/some/path' } },
        { name: '@three/example-module', metadata: { path: '/some/path' } }
      ]);
      expect(instance._modules).toHaveLength(3);
    });
  });

  describe('.getConfigSet', () => {

    it('returns an object with expected properties', async () => {
      const results = await instance.getConfigSet();
      const expected = [
        'app',
        'plugins',
        'modules',
        'root',
        'docsRoot',
        'transforms',
        'structures',
        'lifecycles',
        'guides',
        'actions',
        'commands',
        'configurations'
      ];
      const actual = Object.keys(results);

      expect(actual).toHaveLength(expected.length);
      expected.forEach(k => expect(actual).toContain(k));
    });
  });

  describe('._flattenDetails', () => {
    beforeEach(async () => {
      await instance.addPlugins([{
        name: 'example-plugin',
        metadata: {
          path: '/path/to/node_modules/example-plugin',
          commands: [{ name: 'example-command' }],
          structures: [{ name: 'example-structure' }],
          lifecycles: [{ name: 'example-lifecycle' }],
          configurations: [{ name: 'example-gasket-config' }]
        }
      }, {
        name: '@some/example-plugin',
        metadata: {
          path: '/path/to/node_modules/@some/example-plugin',
          commands: [{ name: 'some-example-command' }],
          structures: [{ name: 'some-example-structure' }],
          lifecycles: [{ name: 'some-example-lifecycle' }],
          configurations: [{ name: 'some-example-gasket-config' }]
        }
      }]);
    });

    it('flattens subDocsConfigs from all plugins', async () => {
      const results = instance.getConfigSet();

      expect(results.commands).toHaveLength(2);
      expect(results.structures).toHaveLength(2);
      expect(results.lifecycles).toHaveLength(2);
      expect(results.configurations).toHaveLength(2);
    });

    it('subDocsConfig includes "from" of parent plugin', async () => {
      const results = instance.getConfigSet();

      expect(results.commands[0]).toHaveProperty('from', 'example-plugin');
    });

    it('subDocsConfig includes sourceRoot of parent plugin', async () => {
      const results = instance.getConfigSet();

      expect(results.commands[0]).toHaveProperty('sourceRoot', '/path/to/node_modules/example-plugin');
    });

    it('subDocsConfig includes targetRoot of parent plugin', async () => {
      const results = instance.getConfigSet();

      expect(results.commands[0]).toHaveProperty('targetRoot', '/path/to/app/.docs/plugins/example-plugin');
    });
  });

  describe('._buildDocsConfig', () => {

    it('returns an object with expected properties', async () => {
      const mockInfo = { metadata: {} };
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

      expect(actual).toHaveLength(expected.length);
      expected.forEach(k => expect(actual).toContain(k));
    });

    it('"link" and "description" selection priority = overrides > moduleInfo > docsSetup > package', async () => {
      const overrides = { link: 'ONE', description: 'ONE' };
      const mockSetup = { link: 'THREE', description: 'THREE' };
      const mockInfo = { package: { homepage: 'FOUR', description: 'FOUR' }, metadata: { path: 'path/to/app' } };
      const fullMockInfo = { link: 'TWO', description: 'TWO', ...mockInfo };

      let results = await instance._buildDocsConfig(fullMockInfo, mockSetup, overrides);
      expect(results).toHaveProperty('link', 'ONE');
      expect(results).toHaveProperty('description', 'ONE');

      results = await instance._buildDocsConfig(fullMockInfo, mockSetup);
      expect(results).toHaveProperty('link', 'TWO');
      expect(results).toHaveProperty('description', 'TWO');

      results = await instance._buildDocsConfig(mockInfo, mockSetup);
      expect(results).toHaveProperty('link', 'THREE');
      expect(results).toHaveProperty('description', 'THREE');

      results = await instance._buildDocsConfig(mockInfo, {});
      expect(results).toHaveProperty('link', 'FOUR');
      expect(results).toHaveProperty('description', 'FOUR');
    });

    it('file "link" is set to null if no matching file added', async () => {
      const mockInfo = { package: {}, path: null, metadata: {} };

      const results = await instance._buildDocsConfig(mockInfo);
      expect(results).toHaveProperty('link', null);
    });

    it('"name" and "sourceRoot" selection priority = overrides > moduleInfo', async () => {
      const mockInfo = { name: 'example-plugin', metadata: { path: '/path/to/example-plugin' } };
      const overrides = { name: 'different', sourceRoot: '/different/path', metadata: { path: '/different/path' } };

      let results = await instance._buildDocsConfig(mockInfo);
      expect(results).toHaveProperty('name', 'example-plugin');
      expect(results).toHaveProperty('sourceRoot', '/path/to/example-plugin');

      results = await instance._buildDocsConfig(mockInfo, {}, overrides);
      expect(results).toHaveProperty('name', 'different');
      expect(results).toHaveProperty('sourceRoot', '/different/path');
    });

    it('only returns local transforms', async () => {
      const mockInfo = { metadata: { path: '/some/path' } };
      const mockSetup = { transforms: [{ global: true }, {}] };

      const results = await instance._buildDocsConfig(mockInfo, mockSetup);
      expect(results.transforms).not.toHaveLength(mockSetup.transforms.length);
      expect(results.transforms).toHaveLength(1);
    });
  });

  describe('._segregateTransforms', () => {

    it('returns only local transforms', () => {
      const results = instance._segregateTransforms([{ global: true }, {}]);
      expect(results).toHaveLength(1);
    });

    it('pushes global transforms to class property', () => {
      expect(instance._transforms).toHaveLength(0);
      instance._segregateTransforms([{ global: true }, {}]);
      expect(instance._transforms).toHaveLength(1);
      expect(instance._transforms[0]).toHaveProperty('global');
    });
  });

  describe('._addModuleDocsSetup', () => {

    it('adds docsSetup for a module key', () => {
      const mockSetup = { link: 'BOGUS.md' };
      expect(instance._moduleDocsSetups).not.toHaveProperty('fake');
      instance._addModuleDocsSetup({ fake: mockSetup });
      expect(instance._moduleDocsSetups).toHaveProperty('fake');
      expect(instance._moduleDocsSetups.fake).toEqual(mockSetup);
    });

    it('merges existing docsSetup for a module', () => {
      const mockSetup = { link: 'BOGUS.md' };
      instance._addModuleDocsSetup({ fake: mockSetup });
      expect(instance._moduleDocsSetups.fake).toHaveProperty('link', 'BOGUS.md');
      expect(instance._moduleDocsSetups.fake).not.toHaveProperty('files');

      instance._addModuleDocsSetup({ fake: { link: 'DIFFERENT.md', files: ['extra-docs/**'] } });

      expect(instance._moduleDocsSetups.fake).not.toEqual(mockSetup);
      // first in doesn't change
      expect(instance._moduleDocsSetups.fake).toHaveProperty('link', 'BOGUS.md');
      expect(instance._moduleDocsSetups.fake).toHaveProperty('files');
    });
  });

  describe('._findAllFiles', () => {
    const mockSourceRoot = fixtures;

    it('adds file from link', async () => {
      const results = await instance._findAllFiles({}, {}, 'README.md', mockSourceRoot);
      expect(results).toContain('README.md');
    });

    it('strips hash from link', async () => {
      const results = await instance._findAllFiles({}, {}, 'README.md#with-hash', mockSourceRoot);
      expect(results).toContain('README.md');
    });

    it('ignores if no sourceRoot', async () => {
      const results = await instance._findAllFiles({}, {}, 'README.md#with-hash', null);
      expect(results).not.toContain('README.md');
      expect(results).toHaveLength(0);
    });

    it('does not add file if link is URL', async () => {
      const results = await instance._findAllFiles({}, {}, 'https://example.com', mockSourceRoot);
      expect(results).toHaveLength(0);
    });

    it('does not add file if link is not set', async () => {
      const results = await instance._findAllFiles({}, {}, null, mockSourceRoot);
      expect(results).toHaveLength(0);
    });

    it('looks up files of docsSetup from sourceRoot', async () => {
      const files = ['./files/*'];
      await instance._findAllFiles({}, { files }, null, mockSourceRoot);
      expect(glob).toHaveBeenCalled();
      files.forEach(file => {
        expect(glob).toHaveBeenCalledWith(
          file,
          expect.objectContaining({
            cwd: mockSourceRoot
          })
        );
      });
    });

    it('adds files from resolved globs', async () => {
      const files = ['./files/*'];
      const expected = ['./files/file-a.md', './files/file-b.md'];
      const results = await instance._findAllFiles({}, { files }, null, mockSourceRoot);
      expect(results).toEqual(expected);
    });

    it('files can be a single string (for safety)', async () => {
      const files = './files/*';
      const expected = ['./files/file-a.md', './files/file-b.md'];
      const results = await instance._findAllFiles({}, { files }, null, mockSourceRoot);
      expect(glob).toHaveBeenCalledWith(files, expect.any(Object));
      expect(results).toEqual(expected);
    });

    it('includes files from from sub type links', async () => {
      const mockInfo = {
        metadata: {
          lifecycles: [{
            link: 'LIFECYCLES.md'
          }],
          commands: [{
            link: 'docs/COMMANDS.md'
          }],
          structures: [{
            link: 'STRUCTURES.md#with-hash'
          }]
        }
      };
      const results = await instance._findAllFiles(mockInfo, {}, null, mockSourceRoot);
      expect(results).toContain('LIFECYCLES.md');
      expect(results).toContain('STRUCTURES.md');
      expect(results).toContain('docs/COMMANDS.md');
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
      const results = await instance._findAllFiles(mockInfo, { files }, 'README.md#with-hash', mockSourceRoot);
      expect(results).toHaveLength(3);
      expect(results).toContain('README.md');
    });
  });
});
