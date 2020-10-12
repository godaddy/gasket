/* eslint-disable max-nested-callbacks */
const assume = require('assume');
const sinon = require('sinon');
const fs = require('fs-extra');
const fsUtils = require('../lib/fs-utils');
const { BuildModules } = require('../lib/build-modules');

describe('buildModules', function () {
  const testSrcFilePath = '/path/to/src/myh-fake/locale/en-US.json';
  const testTgtFilePath = '/path/to/tgt/myh-fake/en-US.json';
  let logger, mockGasket;

  beforeEach(() => {
    logger = {
      log: sinon.stub()
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

  describe('BuildModules', function () {
    let builder;

    beforeEach(function () {
      builder = new BuildModules(mockGasket);
    });

    afterEach(function () {
      builder = null;
      sinon.restore();
    });

    it('sets up dir constants', function () {
      assume(builder).property('_outputDir');
      assume(builder).property('_nodeModulesDir');
      assume(builder).property('_lookupDir');
    });

    describe('#copyFolder', function () {
      it('calls saveJsonFile for correct data', function (done) {
        sinon.stub(fs, 'mkdirp').resolves();
        sinon.stub(fs, 'readdir').resolves(['test/folder/name.json']);
        sinon.stub(fsUtils, 'saveJsonFile').callsFake(() => {
          assume(fs.mkdirp.getCalls()).length(1);
          assume(fs.readdir.getCalls()).length(1);
          assume(fs.readFile.getCalls()).length(1);
          done();
        });
        sinon.stub(fs, 'readFile').resolves('{ "key-1": "value-1" }');
        builder.copyFolder(testSrcFilePath, testTgtFilePath);
      });
    });

    describe('#processFiles', function () {
      let fakeSrcDir, fakeTgtDir;
      beforeEach(() => {
        fakeSrcDir = '/path/to/src/';
        fakeTgtDir = '/path/to/tgt/';

        sinon.stub(builder, 'copyFile');
        sinon.stub(builder, 'copyFolder');
      });
      it('calls copyFile for a json file', function () {
        const fakeFileName = 'aa-AA.json';
        const fakeFiles = [fakeFileName];

        builder.processFiles(fakeSrcDir, fakeTgtDir, fakeFiles);

        assume(builder.copyFile.getCalls()).length(1);
        assume(builder.copyFolder.getCalls()).length(0);
      });
      it('calls copyFolder when its a folder', async function () {
        const fakeFileName = 'some-dir';
        const fakeFiles = [fakeFileName];

        sinon.stub(fs, 'lstat').resolves({ isDirectory: () => true });

        await builder.processFiles(fakeSrcDir, fakeTgtDir, fakeFiles);

        assume(builder.copyFile.getCalls()).length(0);
        assume(builder.copyFolder.getCalls()).length(1);
      });
    });

    describe('#getPackageNameFromDir', function () {
      it('parses and returns the module name', function () {
        assume(builder.getPackageNameFromDir('/src/path/to/test-app/locales')).equals('test-app');
      });
      it('parses and returns the scoped module name', function () {
        assume(builder.getPackageNameFromDir('/src/path/to/@module/test-app/locales')).equals('@module/test-app');
      });
    });

    describe('#getPackageName', function () {
      it('parses and returns the app name', async function () {
        sinon.stub(fs, 'readJson').resolves({ name: 'test-app' });
        assume(await builder.getPackageName('/src/path/to/test-app/locales')).equals('test-app');
      });
      it('parses and returns the scoped module name', async function () {
        sinon.stub(fs, 'readJson').resolves({ name: '@module/test-app' });
        assume(await builder.getPackageName('/src/path/to/@module/test-app/locales')).equals('@module/test-app');
      });
      it('falls back to name from dir if no name in package.json', async function () {
        sinon.stub(fs, 'readJson').resolves({ missing: 'name' });
        assume(await builder.getPackageName('/src/path/to/@another/module/locales')).equals('@another/module');
      });
      it('falls back to name from dir if error reading package.json', async function () {
        sinon.stub(fs, 'readJson').rejects('bad');
        assume(await builder.getPackageName('/src/path/to/@another/module/locales')).equals('@another/module');
      });
    });

    describe('#processDirs', function () {
      let buildDirs;
      beforeEach(function () {
        buildDirs = [
          '/src/test1/locales',
          '/src/test2/locales'
        ];
        sinon.stub(fs, 'remove').resolves();
        sinon.stub(fs, 'mkdirp').resolves();
        sinon.stub(fs, 'readdir').resolves(['test/folder/name.json']);
        sinon.stub(fs, 'readJson').resolves({ name: 'bogus-package' });
        sinon.stub(fsUtils, 'saveJsonFile').resolves();
        sinon.stub(builder, 'processFiles');
      });

      it('calls processFiles for each directory', async function () {
        await builder.processDirs(buildDirs);
        assume(builder.processFiles.getCalls()).length(2);
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
        sinon.stub(fsUtils, 'getDirectories').resolves(discoveredDirs);
      });

      it('returns a list of all locale paths', async function () {
        sinon.stub(fs, 'lstat').resolves({ isDirectory: () => true });
        const results = await builder.discoverDirs();
        assume(results).length(3);
      });

      it('returns a list of all locale paths that are folder', async function () {
        sinon.stub(fs, 'lstat')
          .resolves({ isDirectory: () => true })
          .onCall(0)
          .resolves({ isDirectory: () => false });

        const results = await builder.discoverDirs();
        assume(results).length(2);
      });

      it('excludes blacklisted modules', async function () {
        discoveredDirs.push(
          '/should/blacklist/yargs',
          '/should/not/blacklist/bogus'
        );
        sinon.stub(fs, 'lstat').resolves({ isDirectory: () => true });
        const results = await builder.discoverDirs();
        assume(results).not.includes('/should/blacklist/yargs/locales');
        assume(results).includes('/should/not/blacklist/bogus/locales');
      });
    });

    describe('#run', function () {
      it('only processes discovered locale dirs', async function () {
        sinon.stub(fs, 'remove').resolves();
        sinon.stub(fs, 'mkdirp').resolves();
        sinon.stub(builder, 'discoverDirs').resolves();
        sinon.stub(builder, 'processDirs').resolves();
        await builder.run();
        assume(fs.remove.getCalls()).length(1);
        assume(fs.mkdirp.getCalls()).length(1);
        assume(builder.discoverDirs.getCalls()).length(1);
        assume(builder.processDirs.getCalls()).length(1);
      });
    });
  });
});
