const fs = require('fs-extra');
const path = require('path');
const fsUtils = require('../lib/fs-utils');

describe('fsUtils', function () {
  let results;

  beforeEach(function () {
    results = null;
  });

  describe('#packageName', function () {
    it('returns name if package.json', async function () {
      jest.spyOn(fs, 'readJson').mockImplementation(() => ({ name: 'test-package' }));
      results = await fsUtils.packageName('/some/test/path');
      expect(results).toEqual('test-package');
    });

    it('returns undefined if no package.json', async function () {
      jest.spyOn(fs, 'readJson').mockImplementation(() => {
        throw new Error('Bad things mans');
      });
      results = await fsUtils.packageName('/some/test/path');
      expect(results).toBeUndefined();
    });
  });

  describe('#getPackageDirs', function () {
    it('returns a list of directory paths', async function () {
      jest.spyOn(fs, 'readdir').mockResolvedValue(['file-1', 'dir-1', 'dir-2', 'file-2', 'dir-3']);
      jest.spyOn(fs, 'readJson').mockImplementation(testPath => testPath.indexOf('dir-') >= 0 && { name: testPath });
      jest.spyOn(fs, 'stat').mockImplementation(testPath => {
        return Promise.resolve({ isDirectory: () => testPath.indexOf('dir-') >= 0 });
      });
      results = await fsUtils.getPackageDirs(path.join(__dirname, '..', '..'));
      expect(results.some(([name, f]) => name.includes('dir') && f.includes('dir-'))).toEqual(true);
      expect(results.some(([, f]) => f.includes('file-'))).toEqual(false);
      expect(results).toHaveLength(3);
    });
  });

  describe('#saveJsonFile', function () {
    it('saves json data to file', function () {
      const mockFilePath = '/tmp/file/path';
      const mockJson = { some: 'data' };
      jest.spyOn(fs, 'writeFile').mockImplementation(() => {
      });
      fsUtils.saveJsonFile(mockFilePath, mockJson);
      expect(fs.writeFile).toHaveBeenCalledWith(mockFilePath, JSON.stringify(mockJson, null, 2), 'utf-8');
    });
  });
});
