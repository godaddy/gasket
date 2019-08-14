const fs = require('fs');
import * as serverUtils from './ServerUtils';

const mockLocalesDir = '/some/locales/dir';

describe('ServerUtils', function () {
  describe('#readFile', function () {
    it('should handle error from readFile call', function (done) {
      const mockErr = 'test error';
      fs.readFile = jest.fn((path, callback) => { return callback(mockErr); });
      serverUtils.readFile('/some/test/file')
        .then((data) => {
          expect(data).toBeUndefined();
          done();
        });
    });
    it('should handle error if reading bad json data', function (done) {
      const mockData = 'test data';
      fs.readFile = jest.fn((path, callback) => { return callback(null, mockData); });
      serverUtils.readFile('/some/test/file')
        .then((data) => {
          expect(data).toBeUndefined();
          done();
        });
    });
    it('should return the json object', function (done) {
      const mockData = { test: 'data' };
      fs.readFile = jest.fn((path, callback) => { return callback(null, JSON.stringify(mockData)); });
      serverUtils.readFile('/some/test/file')
        .then((data) => {
          expect(data).toEqual(mockData);
          done();
        });
    });
  });
  describe('#getLocaleManifestFile', function () {
    it('should read the manifest file', async function () {
      const mockData = { test: 'data' };
      fs.readFile = jest.fn((path, callback) => { return callback(null, JSON.stringify(mockData)); });
      await serverUtils.readLocaleManifestFile(mockLocalesDir);
      expect(fs.readFile.mock.calls).toHaveLength(1);
    });
  });
  describe('#getLocaleFile', function () {
    it('should read the locale file', async function () {
      const mockData = { test: 'data' };
      fs.readFile = jest.fn((path, callback) => { return callback(null, JSON.stringify(mockData)); });
      await serverUtils.readLocaleFile({ module: 'module', localeFile: 'filename.json' }, mockLocalesDir);
      expect(fs.readFile.mock.calls).toHaveLength(1);
    });
  });

  describe('#loadLocaleFilesIntoStore', function () {
    let mockStore, modules, dispatchStub, localeApiData, languageData;
    beforeEach(() => {
      localeApiData = {
        getLocaleManifest: {
          isLoaded: true,
          value: {
            'test-app-name': {
              'name.space.name': {
                'en-US': 'b384448',
                'es-MX': '9a5bdd6'
              }
            },
            '@myscope/some-module': {
              'en-US': '12528be',
              'es-MX': 'bbe10d0'
            }
          }
        }
      };
      languageData = {
        language: 'aa-AA'
      };
      dispatchStub = jest.fn();
      modules = ['module-1', 'module-2'];
    });
    it('should read the locale file and call dispatch', async function () {
      const mockState = {
        LocaleApi: localeApiData,
        intl: languageData
      };
      mockStore = {
        getState: () => (mockState),
        dispatch: dispatchStub
      };
      const mockData = { test: 'data' };
      fs.readFile = jest.fn((path, callback) => { return callback(null, JSON.stringify(mockData)); });
      await serverUtils.loadLocaleFilesIntoStore(mockStore, modules, mockLocalesDir);
      expect(dispatchStub.mock.calls).toHaveLength(2);
      expect(fs.readFile.mock.calls).toHaveLength(2);
    });
    it('should read the manifest file and locale file and call dispatch', async function () {
      const mockState = {
        LocaleApi: {},
        intl: languageData
      };
      mockStore = {
        getState: () => (mockState),
        dispatch: dispatchStub
      };
      const mockData = { test: 'data' };
      fs.readFile = jest.fn((path, callback) => { return callback(null, JSON.stringify(mockData)); });
      await serverUtils.loadLocaleFilesIntoStore(mockStore, modules, mockLocalesDir);
      expect(dispatchStub.mock.calls).toHaveLength(3);
    });
  });

  describe('#loadLocaleMapIntoStore', function () {
    let dispatchStub, mockStore;
    beforeEach(() => {
      dispatchStub = jest.fn();
    });
    it('should read the locale manifest and call dispatch', async function () {
      const mockData = { test: 'data' };
      mockStore = {
        getState: () => (mockData),
        dispatch: dispatchStub
      };
      fs.readFile = jest.fn((path, callback) => { return callback(null, JSON.stringify(mockData)); });
      await serverUtils.loadLocaleMapIntoStore(mockStore, mockLocalesDir);
      expect(dispatchStub).toHaveBeenCalledWith(expect.objectContaining({ type: 'LocaleApi_getLocaleManifest_SUCCESS' }));
    });
    it('should return early if already loaded', async function () {
      const mockData = {
        LocaleApi: {
          getLocaleManifest: {
            isLoaded: true,
            value: {}
          }
        }
      };
      mockStore = {
        getState: () => (mockData),
        dispatch: dispatchStub
      };
      await serverUtils.loadLocaleMapIntoStore(mockStore);
      expect(dispatchStub).not.toHaveBeenCalled();
    });
  });
});
