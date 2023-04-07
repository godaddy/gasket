/* eslint-disable max-nested-callbacks */
const fs = require('fs-extra');
const fsUtils = require('../lib/fs-utils');
const { BuildModules } = require('../lib/build-modules');

describe('buildModules', function () {
  const testSrcFilePath = '/path/to/src/myh-fake/locale/en-US.json';
  const testTgtFilePath = '/path/to/tgt/myh-fake/en-US.json';
  let logger, mockGasket;

  beforeEach(function () {
    logger = {
      log: jest.fn()
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
        jest.spyOn(fsUtils, 'saveJsonFile').mockResolvedValue();
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
        expect(builder.getPackageNameFromDir('/src/path/to/test-app/locales')).toEqual('test-app');
      });
      it('parses and returns the scoped module name', function () {
        expect(builder.getPackageNameFromDir('/src/path/to/@module/test-app/locales')).toEqual('@module/test-app');
      });
    });

    describe('#getPackageName', function () {
      it('parses and returns the app name', async function () {
        jest.spyOn(fs, 'readJson').mockResolvedValue({ name: 'test-app' });
        expect(await builder.getPackageName('/src/path/to/test-app/locales')).toEqual('test-app');
      });
      it('parses and returns the scoped module name', async function () {
        jest.spyOn(fs, 'readJson').mockResolvedValue({ name: '@module/test-app' });
        expect(await builder.getPackageName('/src/path/to/@module/test-app/locales')).toEqual('@module/test-app');
      });
      it('falls back to name from dir if no name in package.json', async function () {
        jest.spyOn(fs, 'readJson').mockResolvedValue({ missing: 'name' });
        expect(await builder.getPackageName('/src/path/to/@another/module/locales')).toEqual('@another/module');
      });
      it('falls back to name from dir if error reading package.json', async function () {
        jest.spyOn(fs, 'readJson').mockRejectedValue('bad');
        expect(await builder.getPackageName('/src/path/to/@another/module/locales')).toEqual('@another/module');
      });
    });

    describe('#processDirs', function () {
      let buildDirs;
      beforeEach(function () {
        buildDirs = [
          '/src/test1/locales',
          '/src/test2/locales'
        ];
        jest.spyOn(fs, 'remove').mockResolvedValue();
        jest.spyOn(fs, 'mkdirp').mockResolvedValue();
        jest.spyOn(fs, 'readdir').mockResolvedValue(['test/folder/name.json']);
        jest.spyOn(fs, 'readJson').mockResolvedValue({ name: 'bogus-package' });
        jest.spyOn(fsUtils, 'saveJsonFile').mockResolvedValue();
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
          '/path/to/module/myh-fake',
          '/path/to/module/myh-fake2',
          '/path/to/module/myh-fake3'
        ];
        jest.spyOn(fsUtils, 'getDirectories').mockResolvedValue(discoveredDirs);
      });

      it('returns a list of all locale paths', async function () {
        jest.spyOn(fs, 'lstat').mockResolvedValue({ isDirectory: () => true });
        const results = await builder.discoverDirs();
        expect(results).toHaveLength(3);
      });

      it('returns a list of all locale paths that are folder', async function () {
        jest.spyOn(fs, 'lstat')
          .mockResolvedValueOnce({ isDirectory: () => true })
          .mockResolvedValueOnce({ isDirectory: () => false });

        const results = await builder.discoverDirs();
        expect(results).toHaveLength(2);
      });

      it('excludes blacklisted modules', async function () {
        discoveredDirs.push(
          '/should/blacklist/yargs',
          '/should/not/blacklist/bogus'
        );
        jest.spyOn(fs, 'lstat').mockResolvedValue({ isDirectory: () => true });
        const results = await builder.discoverDirs();
        expect(results).not.toContain('/should/blacklist/yargs/locales');
        expect(results).toContain('/should/not/blacklist/bogus/locales');
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
