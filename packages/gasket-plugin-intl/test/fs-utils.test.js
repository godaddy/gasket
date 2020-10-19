const assume = require('assume');
const sinon = require('sinon');
const fs = require('fs-extra');
const path = require('path');
const fsUtils = require('../lib/fs-utils');

describe('fsUtils', function () {
  let results;

  beforeEach(function () {
    results = null;
  });

  afterEach(function () {
    sinon.restore();
  });

  describe('#isModule', function () {
    it('returns true if it finds package.json', async function () {
      sinon.stub(fs, 'stat').resolves(true);
      results = await fsUtils.isModule('some-test-path');
      assume(results).equals(true);
    });

    it('returns false if it does not find package.json', async function () {
      sinon.stub(fs, 'stat').resolves(false);
      results = await fsUtils.isModule('some-test-path');
      assume(results).equals(false);
    });
  });

  describe('#getDirectories', function () {
    it('returns a list of directory paths', async function () {
      sinon.stub(fs, 'readdir').resolves(['file-1', 'dir-1', 'dir-2', 'file-2', 'dir-3']);
      sinon.stub(fsUtils, 'isModule').callsFake(testPath => testPath.indexOf('dir-') >= 0);
      sinon.stub(fs, 'stat').callsFake(testPath => {
        return Promise.resolve({ isDirectory: () => testPath.indexOf('dir-') >= 0 });
      });
      results = await fsUtils.getDirectories(path.join(__dirname, '..', '..'));
      assume(results.some(f => f.includes('dir-'))).equals(true);
      assume(results.some(f => f.includes('file-'))).equals(false);
      assume(results.length).gte(3);
    });
  });

  describe('#saveJsonFile', function () {
    it('saves json data to file', function () {
      const mockFilePath = '/tmp/file/path';
      const mockJson = { some: 'data' };
      sinon.stub(fs, 'writeFile');
      fsUtils.saveJsonFile(mockFilePath, mockJson);
      assume(fs.writeFile).calledWith(mockFilePath, JSON.stringify(mockJson, null, 2), 'utf-8');
    });
  });
});
