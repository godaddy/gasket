const fs = require('fs-extra');
const path = require('path');
const fsUtils = require('../lib/fs-utils');

describe('fsUtils', function () {
  let results;

  beforeEach(function () {
    results = null;
  });

  describe('#isModule', function () {
    it('returns true if it finds package.json', async function () {
      jest.spyOn(fs, 'stat').mockResolvedValue(true);
      results = await fsUtils.isModule('some-test-path');
      expect(results).toEqual(true);
    });

    it('returns false if it does not find package.json', async function () {
      jest.spyOn(fs, 'stat').mockResolvedValue(false);
      results = await fsUtils.isModule('some-test-path');
      expect(results).toEqual(false);
    });
  });

  describe('#getDirectories', function () {
    it('returns a list of directory paths', async function () {
      jest.spyOn(fs, 'readdir').mockResolvedValue(['file-1', 'dir-1', 'dir-2', 'file-2', 'dir-3']);
      jest.spyOn(fsUtils, 'isModule').mockImplementation(testPath => testPath.indexOf('dir-') >= 0);
      jest.spyOn(fs, 'stat').mockImplementation(testPath => {
        return Promise.resolve({ isDirectory: () => testPath.indexOf('dir-') >= 0 });
      });
      results = await fsUtils.getDirectories(path.join(__dirname, '..', '..'));
      expect(results.some(f => f.includes('dir-'))).toEqual(true);
      expect(results.some(f => f.includes('file-'))).toEqual(false);
      expect(results).toHaveLength(3);
    });
  });

  describe('#saveJsonFile', function () {
    it('saves json data to file', function () {
      const mockFilePath = '/tmp/file/path';
      const mockJson = { some: 'data' };
      jest.spyOn(fs, 'writeFile').mockImplementation(() => {});
      fsUtils.saveJsonFile(mockFilePath, mockJson);
      expect(fs.writeFile).toHaveBeenCalledWith(mockFilePath, JSON.stringify(mockJson, null, 2), 'utf-8');
    });
  });
});
