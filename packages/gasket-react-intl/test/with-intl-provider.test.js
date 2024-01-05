import React from 'react';
import withIntlProviderDefault, { reducer, init } from '../src/with-intl-provider';
import { LocaleStatus } from '../src/utils';
const { ERROR, LOADED, LOADING } = LocaleStatus;

const MockComponent = class extends React.Component {
  render() {
    return <div>MockComponent</div>;
  }
};

describe('withIntlProvider', function () {
  let mockConfig;
  let withIntlProvider;

  beforeEach(function () {
    mockConfig = require('../src/config');
    withIntlProvider = withIntlProviderDefault();
  });

  it('adds display name', function () {
    const WrappedComponent = withIntlProvider(MockComponent);
    expect(WrappedComponent.displayName).toBe('withIntlProvider(MockComponent)');
  });

  it('hoists non-react statics', function () {
    const WrappedComponent = withIntlProvider(MockComponent);
    expect(WrappedComponent).not.toHaveProperty('bogus');
    MockComponent.bogus = 'BOGUS';
    const WrappedComponentBogus = withIntlProvider(MockComponent);
    expect(WrappedComponentBogus).toHaveProperty('bogus', 'BOGUS');
    delete MockComponent.bogus;
  });

  it('hoists getInitialProps if set', function () {
    const WrappedComponent = withIntlProvider(MockComponent);
    expect(WrappedComponent).not.toHaveProperty('getInitialProps');
    MockComponent.getInitialProps = f => f;
    const WrappedComponentSetIP = withIntlProvider(MockComponent);
    expect(WrappedComponentSetIP).toHaveProperty('getInitialProps');
    delete MockComponent.getInitialProps;
  });

  describe('reducer', function () {
    let initState;

    beforeEach(function () {
      initState = {
        messages: { en: { first: 'First' } },
        status: { '/locales/en/first.json': LOADED }
      };
    });

    it('LOADED actions add messages and file status', function () {
      const action = { type: LOADED, payload: { locale: 'en', messages: { example: 'Example' }, file: '/locales/en.json' } };
      const result = reducer(initState, action);
      expect(result).toEqual({
        messages: {
          en: {
            first: 'First',
            example: 'Example'
          }
        },
        status: {
          '/locales/en/first.json': LOADED,
          '/locales/en.json': LOADED
        }
      });
    });

    it('ERROR actions add file status', function () {
      const action = { type: ERROR, payload: { file: '/locales/en.json' } };
      const result = reducer(initState, action);
      expect(result).toEqual({
        messages: {
          en: {
            first: 'First'
          }
        },
        status: {
          '/locales/en/first.json': LOADED,
          '/locales/en.json': ERROR
        }
      });
    });

    it('LOADING actions add file status', function () {
      const action = { type: LOADING, payload: { file: '/locales/en.json' } };
      const result = reducer(initState, action);
      expect(result).toEqual({
        messages: {
          en: {
            first: 'First'
          }
        },
        status: {
          '/locales/en/first.json': LOADED,
          '/locales/en.json': LOADING
        }
      });
    });
  });

  describe('init', function () {
    it('initializes state with empty objects', function () {
      const result = init({});
      expect(result).toEqual({
        messages: {},
        status: {}
      });
    });

    it('initializes state with locales props', function () {
      const result = init({
        locale: 'en',
        messages: { en: { example: 'Example' } },
        status: { '/locales/en.json': LOADED }
      });
      expect(result).toEqual({
        messages: { en: { example: 'Example' } },
        status: { '/locales/en.json': LOADED }
      });
    });

    it('merges locales props data with client data', function () {
      mockConfig.clientData = {
        locale: 'en',
        messages: { en: { first: 'First' } },
        status: { '/locales/en/first.json': LOADED }
      };
      mockConfig.isBrowser = true;

      const result = init({
        locale: 'en',
        messages: { en: { example: 'Example' } },
        status: { '/locales/en.json': LOADED }
      });

      expect(result).toEqual({
        messages: {
          en: {
            first: 'First',
            example: 'Example'
          }
        },
        status: {
          '/locales/en/first.json': LOADED,
          '/locales/en.json': LOADED
        }
      });
    });
  });
});
