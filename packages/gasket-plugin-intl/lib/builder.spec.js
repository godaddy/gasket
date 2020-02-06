import fs from 'fs-extra';
const path = require('path');
import fsUtils from './fsUtils';
import Builder from './builder';
const defaultConfig = require('./default-config');

describe('Builder', function () {
  const testSrcFilePath = '/path/to/src/myh-fake/locale/en-US.json';
  const testTgtFilePath = '/path/to/tgt/myh-fake/en-US.json';
  let logger;

  beforeEach(() => {
    logger = {
      log: () => {}
    };
  });

  afterEach(function () {
    jest.restoreAllMocks();
  });

  describe('Builder', function () {
    let builder;

    beforeEach(function () {
      builder = new Builder(logger, defaultConfig);
    });

    afterEach(function () {
      builder = null;
      jest.resetAllMocks();
    });

    it('sets up dir constants', function () {
      expect(builder).toHaveProperty('_rootDir');
      expect(builder).toHaveProperty('_nodeModulesDir');
      expect(builder).toHaveProperty('_outputDir');
    });

    describe('#updateFolderHash', function () {
      it('updates the map with file hash if set', function () {
        const folder = '/path/to/target/@module/fake';
        const file = 'XYZ123.aa-AA.json';
        expect(builder.builderMap).toEqual({});
        builder.updateFolderHash(folder, file);
        expect(builder.builderMap).toEqual({
          '@module': {
            fake: {
              'aa-AA': 'XYZ123'
            }
          }
        });
      });
      it('ignores updating if hash not set', function () {
        const folder = '/path/to/target/@module/fake/test';
        const file = '';
        expect(builder.builderMap).toEqual({});
        builder.updateFolderHash(folder, file);
        expect(builder.builderMap).toEqual({});
      });
    });

    describe('#getNamespace', function () {
      it('returns the namespace component of the file name', function () {
        const file = 'name.space.name.json';
        const ns = builder.getNamespace(file);
        expect(ns).toEqual('name.space.name');
      });
      it('ignores updating if hash not set', function () {
        const folder = '/path/to/target/@module/fake/test';
        const file = '';
        expect(builder.builderMap).toEqual({});
        builder.updateFolderHash(folder, file);
        expect(builder.builderMap).toEqual({});
      });
    });

    describe('#moveFolder', function () {
      it('calls saveJsonFile for correct data', function (done) {
        fs.mkdirp = jest.fn().mockReturnValue(Promise.resolve());
        fs.readdir = jest.fn().mockResolvedValue(['test/folder/name.json']);
        fsUtils.saveJsonFile = jest.fn(() => {
          expect(fs.mkdirp.mock.calls).toHaveLength(1);
          expect(fs.readdir.mock.calls).toHaveLength(1);
          expect(fs.readFile.mock.calls).toHaveLength(1);
          done();
        });
        fs.readFile = jest.fn().mockResolvedValue('{ "key-1": "value-1" }');
        builder.moveFolder(testSrcFilePath, testTgtFilePath);
      });
    });

    describe('#updateFileHash', function () {
      it('updates the map with file hash if set', function () {
        const tgt = '/path/to/target/fake-app';
        const file = 'XYZ123.aa-AA.json';
        expect(builder.builderMap).toEqual({});
        builder.updateFileHash(tgt, file);
        expect(builder.builderMap).toEqual({
          'fake-app': {
            'aa-AA': 'XYZ123'
          }
        });
      });
      it('ignores updating if hash not set', function () {
        const tgt = '/path/to/target/fake-app';
        const file = 'test';
        expect(builder.builderMap).toEqual({});
        builder.updateFileHash(tgt, file);
        expect(builder.builderMap).toEqual({});
      });
    });

    describe('#moveFile', function () {
      it('calls prepareFile if prepare true', function (done) {
        fs.readFile = jest.fn().mockResolvedValue('{ "key-1": "value-1" }');
        builder.updateFileHash = jest.fn();

        fsUtils.saveJsonFile = jest.fn(() => {
          expect(fs.readFile.mock.calls).toHaveLength(1);
          expect(builder.updateFileHash.mock.calls).toHaveLength(1);
          done();
        });
        builder.moveFile(testSrcFilePath, testTgtFilePath);
      });
    });

    describe('#processFiles', function () {
      let fakeSrcDir, fakeTgtDir;
      beforeEach(() => {
        fakeSrcDir = '/path/to/src/';
        fakeTgtDir = '/path/to/tgt/';

        builder.moveFile = jest.fn();
        builder.moveFolder = jest.fn();
      });
      it('calls moveFile for a json file', function () {
        const fakeFileName = 'aa-AA.json';
        const fakeFiles = [fakeFileName];

        builder.processFiles(fakeSrcDir, fakeTgtDir, fakeFiles);

        expect(builder.moveFile.mock.calls).toHaveLength(1);
        expect(builder.moveFolder.mock.calls).toHaveLength(0);
      });
      it('calls moveFolder when its a folder', async function () {
        const fakeFileName = 'some-dir';
        const fakeFiles = [fakeFileName];

        fs.lstat = jest.fn(() => {
          return new Promise((resolve) => {
            resolve({
              isDirectory: () => {
                return true;
              }
            });
          });
        });

        await builder.processFiles(fakeSrcDir, fakeTgtDir, fakeFiles);

        expect(builder.moveFile.mock.calls).toHaveLength(0);
        expect(builder.moveFolder.mock.calls).toHaveLength(1);
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
        fs.readJson = jest.fn().mockResolvedValue({ name: 'test-app' });
        expect(await builder.getPackageName('/src/path/to/test-app/locales')).toEqual('test-app');
      });
      it('parses and returns the scoped module name', async function () {
        fs.readJson = jest.fn().mockResolvedValue({ name: '@module/test-app' });
        expect(await builder.getPackageName('/src/path/to/@module/test-app/locales')).toEqual('@module/test-app');
      });
      it('falls back to name from dir if no name in package.json', async function () {
        fs.readJson = jest.fn().mockResolvedValue({ missing: 'name' });
        expect(await builder.getPackageName('/src/path/to/@another/module/locales')).toEqual('@another/module');
      });
      it('falls back to name from dir if error reading package.json', async function () {
        fs.readJson = jest.fn().mockRejectedValue('bad');
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
        fs.remove = jest.fn().mockReturnValue(Promise.resolve());
        fs.mkdirp = jest.fn().mockReturnValue(Promise.resolve());
        fs.readdir = jest.fn().mockResolvedValue(['test/folder/name.json']);
        fs.readJson = jest.fn().mockResolvedValue({ name: 'bogus-package' });
        fsUtils.saveJsonFile = jest.fn().mockReturnValue(Promise.resolve());
        builder.processFiles = jest.fn();
      });

      it('calls processFiles for each directory', async function () {
        await builder.processDirs(buildDirs);
        expect(builder.processFiles.mock.calls).toHaveLength(2);
      });

      it('saves locales manifest file', async function () {
        await builder.processDirs(buildDirs);
        expect(fsUtils.saveJsonFile).toHaveBeenCalledWith(expect.stringContaining('locales-manifest.json'), expect.any(Object));
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
        fsUtils.getDirectories = jest.fn(() => (discoveredDirs));
      });

      it('returns a list of all locale paths', async function () {
        fs.lstat = jest.fn(() => {
          return new Promise((resolve) => {
            resolve({
              isDirectory: () => {
                return true;
              }
            });
          });
        });
        const results = await builder.discoverDirs();
        expect(results).toHaveLength(4);
      });

      it('returns a list of all locale paths that are folder', async function () {
        fs.lstat = jest.fn(() => {
          return new Promise((resolve) => {
            resolve({
              isDirectory: () => {
                return true;
              }
            });
          });
        }).mockImplementationOnce(() => {
          return new Promise((resolve) => {
            resolve({
              isDirectory: () => {
                return false;
              }
            });
          });
        });

        const results = await builder.discoverDirs();
        expect(results).toHaveLength(3);
      });

      it('excludes blacklisted modules', async function () {
        discoveredDirs.push(
          '/should/blacklist/yargs',
          '/should/not/blacklist/bogus'
        );
        fs.lstat = jest.fn(() => {
          return new Promise((resolve) => {
            resolve({
              isDirectory: () => {
                return true;
              }
            });
          });
        });
        const results = await builder.discoverDirs();
        expect(results).not.toContain('/should/blacklist/yargs/locales');
        expect(results).toContain('/should/not/blacklist/bogus/locales');
      });
    });

    describe('#run', function () {
      it('only processes discovered locale dirs', async function () {
        fs.remove = jest.fn().mockReturnValue(Promise.resolve());
        fs.mkdirp = jest.fn().mockReturnValue(Promise.resolve());
        builder.discoverDirs = jest.fn().mockReturnValue(Promise.resolve());
        builder.processDirs = jest.fn().mockReturnValue(Promise.resolve());
        await builder.run();
        expect(fs.remove.mock.calls).toHaveLength(1);
        expect(fs.mkdirp.mock.calls).toHaveLength(1);
        expect(builder.discoverDirs.mock.calls).toHaveLength(1);
        expect(builder.processDirs.mock.calls).toHaveLength(1);
      });
    });

    describe('#isMainPackage', function () {
      it('checks if the current path matches the default app path', function () {
        expect(builder.isMainPackage(path.join(process.cwd(), 'locales'))).toEqual(true);
        expect(builder.isMainPackage(path.join(process.cwd(), 'some-module', 'locales'))).toEqual(false);
      });
    });
  });
});
