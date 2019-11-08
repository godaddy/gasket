const fs = require('fs-extra');
const path = require('path');
import fsUtils from './fsUtils';

describe('fsUtils', function () {
  let results;

  beforeEach(() => {
    results = null;
  });

  describe('#isModule', function () {
    it('returns true if it finds package.json', async function () {
      fs.stat = jest.fn(() => false).mockImplementationOnce(() => true);
      results = await fsUtils.isModule('some-test-path');
      expect(results).toEqual(true);
    });
    it('returns false if it does not find package.json', async function () {
      fs.stat = jest.fn(() => false);
      results = await fsUtils.isModule('some-test-path');
      expect(results).toEqual(false);
    });
  });

  describe('#getDirectories', function () {
    it('returns a list of directory paths', async function () {
      fs.readdir = jest
        .fn(() => [])
        .mockImplementationOnce(() => ['file-1', 'dir-1', 'dir-2', 'file-2', 'dir-3']);
      fsUtils.isModule = jest.fn(testPath => testPath.indexOf('dir-') >= 0);
      fs.stat = jest
        .fn(testPath => {
          return Promise.resolve({ isDirectory: () => testPath.indexOf('dir-') >= 0 });
        });
      results = await fsUtils.getDirectories(path.join(__dirname, '..', '..'));
      expect(results.some(f => f.includes('dir-'))).toEqual(true);
      expect(results.some(f => f.includes('file-'))).toEqual(false);
      expect(results.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('#saveJsonFile', function () {
    it('saves json data to file', function () {
      const mockFilePath = '/tmp/file/path';
      const mockJson = { some: 'data' };
      fs.writeFile = jest.fn();
      fsUtils.saveJsonFile(mockFilePath, mockJson);
      expect(fs.writeFile).toHaveBeenCalledWith(mockFilePath, JSON.stringify(mockJson, null, 2), 'utf-8');
    });
  });
});
