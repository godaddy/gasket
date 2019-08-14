/* eslint-disable no-console */
import React from 'react';
import { shallow, mount } from 'enzyme';
import withIntlProvider from './WithIntlProvider';
import { IntlProvider } from 'react-intl';
import * as serverUtils from './ServerUtils';
import configureMockStore from 'redux-mock-store';

const mockResource = {
  isLoaded: true,
  hasError: false,
  isUpdating: false
};

describe('<withIntlProvider />', () => {
  let Component, wrapper, testProps, initialState, mockStore;
  const MockComponent = class extends React.Component {
    render() {
      return <div>MockComponent</div>;
    }
  };

  beforeEach(() => {
    Component = withIntlProvider()(MockComponent);
    initialState = {
      LocaleApi: {
        'getLocaleManifest': {
          ...mockResource,
          value: { 'test-app-name': 'map' }
        },
        'getMessages__localeFile:9a5bdd6.es-MX.json__module:test-app-name/name.space.name': {
          ...mockResource,
          value: { 'key-1': 'value-1' }
        },
        'getMessages__localeFile:bbe10d0.es-MX.json__module:@myscope/some-module/': {
          ...mockResource,
          value: { 'key-2': 'value-2' }
        }
      }
    };

    mockStore = configureMockStore()(initialState);
    mockStore.dispatch = jest.fn();
    testProps = { store: mockStore };
  });

  describe('#render', () => {
    it('wraps target component with IntlProvider and renders children', () => {
      wrapper = shallow(<Component { ...testProps } />);
      expect(wrapper.find(IntlProvider)).toBeDefined();
      expect(wrapper.find(MockComponent)).toBeDefined();
    });
  });

  describe('#mount', () => {
    it('does not dispatch action if manifest already loaded', () => {
      mount(<Component { ...testProps } />).mount();
      expect(mockStore.dispatch).not.toHaveBeenCalled();
    });

    it('dispatches action if manifest is NOT loaded', () => {
      initialState.LocaleApi = {};

      mockStore = configureMockStore()(initialState);
      mockStore.dispatch = jest.fn();
      testProps = { store: mockStore };

      mount(<Component { ...testProps } />).mount();
      expect(mockStore.dispatch).toHaveBeenCalled();
    });
  });

  describe('#getInitialProps', () => {
    beforeEach(() => {
      console.error = jest.fn();
    });

    afterEach(() => {
      console.error.mockClear();
    });

    it('loads locale manifest if running on server', () => {
      serverUtils.loadLocaleMapIntoStore = jest.fn();
      const testStore = { test: 'store' };
      Component.getInitialProps({ ctx: { isServer: true, store: testStore, req: { localesDir: 'bogus' } } });
      expect(serverUtils.loadLocaleMapIntoStore).toHaveBeenCalledWith(testStore, 'bogus');
    });

    it('does not load locale manifest if localeDir not available', () => {
      serverUtils.loadLocaleMapIntoStore = jest.fn();
      const testStore = { test: 'store' };
      Component.getInitialProps({ ctx: { isServer: true, store: testStore, req: {} } });
      expect(serverUtils.loadLocaleMapIntoStore).not.toHaveBeenCalled();
    });

    it('logs an error if localeDir not available', () => {
      const testStore = { test: 'store' };
      Component.getInitialProps({ ctx: { isServer: true, store: testStore, req: {} } });
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('withIntlProvider: localesDir undefined'));
    });

    it('does not load locale manifest if not running on server', () => {
      serverUtils.loadLocaleMapIntoStore = jest.fn();
      const testStore = { test: 'store' };
      Component.getInitialProps({ ctx: { isServer: false, store: testStore, req: { localesDir: 'bogus' } } });
      expect(serverUtils.loadLocaleMapIntoStore.mock.calls).toHaveLength(0);
    });
  });
});
