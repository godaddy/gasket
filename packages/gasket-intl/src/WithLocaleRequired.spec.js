/* eslint-disable no-console */
import React from 'react';
import { shallow } from 'enzyme';
import localeApi from './LocaleApi';
import withLocaleRequired from './WithLocaleRequired';
import LocaleRequired from './LocaleRequired';
import * as serverUtils from './ServerUtils';

describe('<withLocaleRequired />', () => {
  let Component, wrapper, mockStore, mockState, localeMap;
  const mockApp = 'my-test-app';
  const MockComponent = class extends React.Component {
    render() {
      return <div>MockComponent</div>;
    }
  };

  beforeEach(() => {
    localeMap = {
      '__default__': 'my-test-app',
      'my-test-app': {
        'aa-AA': 'aaaaaaa'
      }
    };
    mockState = {
      intl: {
        language: 'aa-AA'
      },
      LocaleApi: {
        getLocaleManifest: {
          isLoaded: true,
          value: localeMap
        }
      }
    };
    Component = withLocaleRequired(mockApp)(MockComponent);
    mockStore = {
      getState: () => mockState,
      dispatch: jest.fn()
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('#render', () => {
    beforeEach(() => {
      wrapper = shallow(<Component />);
    });

    it('wraps target component with LocaleRequired', () => {
      expect(wrapper.find(LocaleRequired)).toExist;
    });
    it('exposes target component as WrappedComponent', () => {
      expect(wrapper.find('WrappedComponent')).toExist;
    });
  });

  describe('#getInitialProps', () => {
    beforeEach(() => {
      console.error = jest.fn();
    });

    afterEach(() => {
      console.error.mockClear();
    });

    it('reads locale files if running on server', () => {
      serverUtils.loadLocaleFilesIntoStore = jest.fn();
      Component.getInitialProps({ isServer: true, store: mockStore, req: { localesDir: 'bogus' } });
      expect(serverUtils.loadLocaleFilesIntoStore).toHaveBeenCalledWith(mockStore, mockApp, 'bogus');

      expect(mockStore.dispatch).not.toHaveBeenCalled();
    });

    it('does not load locale file if req.localeDir not available', () => {
      serverUtils.loadLocaleFilesIntoStore = jest.fn();
      Component.getInitialProps({ isServer: true, store: mockStore, req: {} });
      expect(serverUtils.loadLocaleFilesIntoStore).not.toHaveBeenCalled();
    });

    it('logs an error if req.localeDir not available', () => {
      Component.getInitialProps({ isServer: true, store: mockStore, req: {} });
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('withLocaleRequired: localesDir undefined'));
    });

    it('does not read locale files if not running on server', () => {
      serverUtils.loadLocaleFilesIntoStore = jest.fn();
      Component.getInitialProps({ isServer: false, store: mockStore });
      expect(serverUtils.loadLocaleFilesIntoStore).not.toHaveBeenCalled();
    });

    it('dispatches actions to load locale files in browser', async () => {
      const spy = jest.spyOn(localeApi.actionCreators, 'getMessages');
      await Component.getInitialProps({ isServer: false, store: mockStore });
      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ module: 'my-test-app', localeFile: 'aaaaaaa.aa-AA.json' }));
    });

    it('does not dispatch actions to load locale files in browser if its already loaded', async () => {
      const spy = jest.spyOn(localeApi.actionCreators, 'getMessages');
      mockState = {
        intl: {
          language: 'aa-AA'
        },
        LocaleApi: {
          'getLocaleManifest': {
            isLoaded: true,
            error: null,
            hasError: false,
            isUpdating: false,
            value: {
              'my-test-app': {
                'aa-AA': '9f32212'
              }
            }
          },
          'getMessages__localeFile:9f32212.aa-AA.json__module:my-test-app': {
            value: {
              some_key: 'Some Value'
            },
            error: null,
            isLoaded: true,
            hasError: false,
            isUpdating: false
          }
        }
      };
      await Component.getInitialProps({ isServer: false, store: mockStore });
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
