/* eslint-disable max-nested-callbacks */
const fs = require('fs-extra');
const { getPackageDirs, saveJsonFile } = require('../lib/fs-utils');
const { BuildModules } = require('../lib/build-modules');

jest.mock('../lib/fs-utils');

describe('buildModules', function () {
  const testSrcFilePath = '/path/to/src/myh-fake/locale/en-US.json';
  const testTgtFilePath = '/path/to/tgt/myh-fake/en-US.json';
  let logger, mockGasket;

  beforeEach(function () {
    logger = {
      info: jest.fn(),
      warn: jest.fn()
    };
    mockGasket = {
      logger,
      config: {
        root: '/path/to/somewhere',
        intl: {
          localesDir: '/path/to/somewhere/public/locales',
          modules: {
            localesDir: 'locales',
            excludes: ['cacache', 'yargs', 'axe-core']
          }
        }
      }
    };
  });

  afterEach(function () {
    jest.clearAllMocks();
  });

  describe('BuildModules', function () {
    let builder;

    beforeEach(function () {
      builder = new BuildModules(mockGasket);
    });

    afterEach(function () {
      builder = null;
      jest.clearAllMocks();
    });

    it('sets up dir constants', function () {
      expect(builder).toHaveProperty('_outputDir');
      expect(builder).toHaveProperty('_nodeModulesDir');
      expect(builder).toHaveProperty('_lookupDir');
    });

    describe('#copyFolder', function () {
      it('calls saveJsonFile for correct data', async function () {
        jest.spyOn(fs, 'mkdirp').mockResolvedValue();
        jest.spyOn(fs, 'readdir').mockResolvedValue(['test/folder/name.json']);
        saveJsonFile.mockResolvedValue();
        jest.spyOn(fs, 'readFile').mockResolvedValue('{ "key-1": "value-1" }');
        await builder.copyFolder(testSrcFilePath, testTgtFilePath);
        expect(fs.mkdirp).toHaveBeenCalledTimes(1);
        expect(fs.readdir).toHaveBeenCalledTimes(1);
        expect(fs.readFile).toHaveBeenCalledTimes(1);
      });
    });

    describe('#processFiles', function () {
      let fakeSrcDir, fakeTgtDir;

      beforeEach(function () {
        fakeSrcDir = '/path/to/src/';
        fakeTgtDir = '/path/to/tgt/';

        jest.spyOn(builder, 'copyFile');
        jest.spyOn(builder, 'copyFolder');
      });

      afterEach(() => {
        jest.clearAllMocks();
      });

      it('calls copyFile for a json file', function () {
        const fakeFileName = 'aa-AA.json';
        const fakeFiles = [fakeFileName];

        builder.processFiles(fakeSrcDir, fakeTgtDir, fakeFiles);

        expect(builder.copyFile).toHaveBeenCalledTimes(1);
        expect(builder.copyFolder).toHaveBeenCalledTimes(0);
      });

      it('calls copyFolder when its a folder', async function () {
        const fakeFileName = 'some-dir';
        const fakeFiles = [fakeFileName];

        jest.spyOn(fs, 'lstat').mockResolvedValue({ isDirectory: () => true });
        jest.spyOn(fs, 'readdir').mockResolvedValue(['test/folder']);

        await builder.processFiles(fakeSrcDir, fakeTgtDir, fakeFiles);
        expect(builder.copyFile).not.toHaveBeenCalled();
        expect(builder.copyFolder).toHaveBeenCalledTimes(1);
      });
    });

    describe('#getPackageNameFromDir', function () {
      it('parses and returns the module name', function () {
        expect(
          builder.getPackageNameFromDir('/src/path/to/test-app/locales')
        ).toEqual('test-app');
      });
      it('parses and returns the scoped module name', function () {
        expect(
          builder.getPackageNameFromDir('/src/path/to/@module/test-app/locales')
        ).toEqual('@module/test-app');
      });
    });

    describe('#getPackageName', function () {
      it('parses and returns the app name', async function () {
        jest.spyOn(fs, 'readJson').mockResolvedValue({ name: 'test-app' });
        expect(
          await builder.getPackageName('/src/path/to/test-app/locales')
        ).toEqual('test-app');
      });
      it('parses and returns the scoped module name', async function () {
        jest
          .spyOn(fs, 'readJson')
          .mockResolvedValue({ name: '@module/test-app' });
        expect(
          await builder.getPackageName('/src/path/to/@module/test-app/locales')
        ).toEqual('@module/test-app');
      });
      it('falls back to name from dir if no name in package.json', async function () {
        jest.spyOn(fs, 'readJson').mockResolvedValue({ missing: 'name' });
        expect(
          await builder.getPackageName('/src/path/to/@another/module/locales')
        ).toEqual('@another/module');
      });
      it('falls back to name from dir if error reading package.json', async function () {
        jest.spyOn(fs, 'readJson').mockRejectedValue('bad');
        expect(
          await builder.getPackageName('/src/path/to/@another/module/locales')
        ).toEqual('@another/module');
      });
    });

    describe('#processDirs', function () {
      let buildDirs;
      beforeEach(function () {
        buildDirs = ['/src/test1/locales', '/src/test2/locales'];
        jest.spyOn(fs, 'remove').mockResolvedValue();
        jest.spyOn(fs, 'mkdirp').mockResolvedValue();
        jest.spyOn(fs, 'readdir').mockResolvedValue(['test/folder/name.json']);
        jest.spyOn(fs, 'readJson').mockResolvedValue({ name: 'bogus-package' });
        saveJsonFile.mockResolvedValue();
        jest.spyOn(builder, 'processFiles');
      });

      it('calls processFiles for each directory', async function () {
        await builder.processDirs(buildDirs);
        expect(builder.processFiles).toHaveBeenCalledTimes(2);
      });
    });

    describe('#discoverDirs', function () {
      let discoveredDirs;
      beforeEach(function () {
        discoveredDirs = [
          ['myh-fake', '/path/to/module/myh-fake'],
          ['myh-fake2', '/path/to/module/myh-fake2'],
          ['myh-fake3', '/path/to/module/myh-fake3']
        ];
        getPackageDirs.mockImplementation(async function *mockGen() {
          for (const pair of discoveredDirs) {
            yield pair;
          }
        });
      });

      it('returns a list of all locale paths', async function () {
        jest.spyOn(fs, 'lstat').mockResolvedValue({ isDirectory: () => true });
        const results = await builder.discoverDirs();
        expect(results).toHaveLength(3);
      });

      it('returns a list of all locale paths that are folder', async function () {
        jest
          .spyOn(fs, 'lstat')
          .mockResolvedValueOnce({ isDirectory: () => true })
          .mockResolvedValueOnce({ isDirectory: () => false });

        const results = await builder.discoverDirs();
        expect(results).toHaveLength(2);
      });

      it('excludes blacklisted modules', async function () {
        const expected = ['mod1', '/should/not/blacklist/bogus'];
        const notExpected = ['mod2', '/should/blacklist/yargs'];
        discoveredDirs.push(expected, notExpected);
        jest.spyOn(fs, 'lstat').mockResolvedValue({ isDirectory: () => true });
        const results = await builder.discoverDirs();
        expect(results).toHaveLength(discoveredDirs.length - 1);
        expect(results).toEqual(
          expect.arrayContaining([
            ['mod1', '/should/not/blacklist/bogus/locales']
          ])
        );
      });
    });

    describe('#gatherModules', function () {
      it('returns a list of all packages with verified dirs', async function () {
        jest
          .spyOn(fs, 'lstat')
          .mockResolvedValueOnce({ isDirectory: () => true });

        mockGasket.config.intl.modules = [
          '@first/package',
          '@second/package/custom-locales'
        ];
        builder = new BuildModules(mockGasket);

        const results = await builder.gatherModuleDirs();
        expect(results).toHaveLength(2);
        expect(results).toEqual(
          expect.arrayContaining([
            [
              '@first/package',
              '/path/to/somewhere/node_modules/@first/package/locales'
            ],
            [
              '@second/package',
              '/path/to/somewhere/node_modules/@second/package/custom-locales'
            ]
          ])
        );
      });

      it('logs warning when locales dir not found', async function () {
        jest
          .spyOn(fs, 'lstat')
          .mockResolvedValueOnce({ isDirectory: () => false });

        mockGasket.config.intl.modules = ['@third/package/missing-locales'];
        builder = new BuildModules(mockGasket);

        const results = await builder.gatherModuleDirs();
        expect(results).toHaveLength(0);

        expect(logger.warn).toHaveBeenCalledWith(
          'build:locales: locales directory not found for: @third/package/missing-locales'
        );
      });

      it('logs warning when module names are malformed', async function () {
        jest
          .spyOn(fs, 'lstat')
          .mockResolvedValueOnce({ isDirectory: () => true });

        mockGasket.config.intl.modules = [
          '@malformed',
          'wrong!',
          '@scope/wrong!',
          '@b&d/path',
          '@looks/good/but/**ps'
        ];
        builder = new BuildModules(mockGasket);
        const results = await builder.gatherModuleDirs();

        expect(results).toHaveLength(0);

        mockGasket.config.intl.modules.forEach((name) => {
          expect(logger.warn).toHaveBeenCalledWith(
            `build:locales: malformed module name: ${name}`
          );
        });
      });

      it('supports expected module formats', async function () {
        jest
          .spyOn(fs, 'lstat')
          .mockResolvedValueOnce({ isDirectory: () => true });

        mockGasket.config.intl.modules = [
          '@first/package',
          '@second/package/custom-locales',
          'an_underscore_package',
          'a-dash-package',
          'an_underscore_package/with_underscore_locales',
          'a-dash-package/with-dash-locales',
          '@an_underscore_scope/and_package',
          '@a-dash-scope/and-package'
        ];
        builder = new BuildModules(mockGasket);
        const results = await builder.gatherModuleDirs();

        expect(results).toHaveLength(mockGasket.config.intl.modules.length);
        expect(logger.warn).not.toHaveBeenCalled();

        mockGasket.config.intl.modules.forEach((name) => {
          expect(results).toEqual(
            expect.arrayContaining([
              [expect.any(String), expect.stringContaining(name)]
            ])
          );
        });
      });
    });

    describe('#run', function () {
      it('only processes discovered locale dirs', async function () {
        jest.spyOn(fs, 'remove').mockResolvedValue();
        jest.spyOn(fs, 'mkdirp').mockResolvedValue();
        jest.spyOn(builder, 'discoverDirs').mockResolvedValue();
        jest.spyOn(builder, 'processDirs').mockResolvedValue();
        await builder.run();
        expect(fs.remove).toHaveBeenCalledTimes(1);
        expect(fs.mkdirp).toHaveBeenCalledTimes(1);
        expect(builder.discoverDirs).toHaveBeenCalledTimes(1);
        expect(builder.processDirs).toHaveBeenCalledTimes(1);
      });
    });
  });
});
