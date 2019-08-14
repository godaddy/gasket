import LocaleApi, {
  selectAllMessages,
  selectLocaleManifestValue,
  selectAssetPrefix,
  selectMessage
} from './LocaleApi';

describe('LocaleApi', function () {
  let mockState;

  beforeEach(() => {
    mockState = {
      LocaleApi: {
        'getMessages__localeFile:a': { isLoaded: true, value: { 'key-1': 'value-1' } },
        'getMessages__localeFile:b': { isLoaded: true, value: { 'key-2': 'value-2' } },
        'getMessages__localeFile:c': { isLoaded: true, value: { 'key-3': 'value-3' } },
        'getMessages__localeFile:d': { isLoaded: false, value: null },
        'getLocaleManifest': { isLoaded: true, value: { id: '123' } },
        'getSomeOtherData__id:c': { isLoaded: true, value: { id: '123' } },
        'getSomeOtherData__param:c': { isLoaded: false, value: null }
      }
    };
  });

  describe('setupApi', function () {

    it('sets up expected actionCreator', function () {
      expect(LocaleApi.actionCreators.getMessages).toBeInstanceOf(Function);
      expect(LocaleApi.actionCreators.getLocaleManifest).
        toBeInstanceOf(Function);
    });

    it('sets up expected selector', function () {
      expect(LocaleApi.selectors.getMessages).toBeInstanceOf(Function);
      expect(LocaleApi.selectors.getLocaleManifest).toBeInstanceOf(Function);
    });
  });

  describe('selectAssetPrefix', function () {

    it('should return blank string if intl not set', function () {
      const getState = function () {
        return {};
      };
      const result = selectAssetPrefix(getState());
      expect(result).toEqual('');
    });

    it('should return blank string if apiBase not set', function () {
      const getState = function () {
        return { intl: {} };
      };
      const result = selectAssetPrefix(getState());
      expect(result).toEqual('');
    });

    it('should return assetPrefix', function () {
      const getState = function () {
        return { intl: { assetPrefix: '/something' } };
      };
      const result = selectAssetPrefix(getState());
      expect(result).toEqual('/something');
    });
  });

  describe('selectAllMessages', function () {

    it('should combine messages into one object if store has message resources',
      function () {
        expect(selectAllMessages(mockState)).toEqual({
          'key-1': 'value-1',
          'key-2': 'value-2',
          'key-3': 'value-3'
        });
      });

    it('should return empty object if store has no message resources',
      function () {
        expect(selectAllMessages({})).toEqual({});
      });
  });

  describe('selectMessage', function () {

    it('should get a single message by id', function () {
      expect(selectMessage(mockState, 'key-1')).toEqual('value-1');
      expect(selectMessage(mockState, 'key-2')).toEqual('value-2');
    });

    it('should return an id name if no id found', function () {
      expect(selectMessage(mockState, 'bogus')).toEqual('bogus');
    });

    it('should return defaultMessage only if set and no id found', function () {
      const defaultMessage = 'A fallback message';
      expect(selectMessage(mockState, 'key-1', defaultMessage)).toEqual('value-1');
      expect(selectMessage(mockState, 'bogus', defaultMessage)).toBe(defaultMessage);
    });
  });

  describe('selectLocaleManifestValue', function () {

    it('get the locale manifest from redux store', function () {
      expect(selectLocaleManifestValue(mockState)).toEqual({ id: '123' });
    });

    it('should return undefined if store has no message resources', function () {
      expect(selectLocaleManifestValue({})).toBeUndefined();
    });

    it('should return undefined if store is not loaded', function () {
      mockState.LocaleApi = {
        ...mockState.LocaleApi,
        getLocaleManifest: { isLoaded: false, value: null }
      };
      expect(selectLocaleManifestValue(mockState)).toBeUndefined();
    });
  });
});
