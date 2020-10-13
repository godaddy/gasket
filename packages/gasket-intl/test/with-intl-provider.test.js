import React from 'react';
import assume from 'assume';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import { mount } from 'enzyme';
import { IntlProvider } from 'react-intl';
import mockManifest from './fixtures/mock-manifest.json';
import { ERROR, LOADED, LOADING } from '../src/utils';

const MockComponent = class extends React.Component {
  render() {
    return <div>MockComponent</div>;
  }
};

describe('withIntlProvider', function () {
  let mockConfig, withIntlProvider, wrapper, testProps, module;

  const doMount = props => {
    const Wrapped = withIntlProvider()(MockComponent);
    return mount(<Wrapped { ...props } />);
  };
  const getModule = () => {
    return proxyquire('../src/with-intl-provider', {
      './config': mockConfig,
      './utils': proxyquire('../src/utils', {
        './config': mockConfig
      })
    });
  };

  beforeEach(function () {
    mockConfig = {
      defaultLocale: 'en-US',
      manifest: { ...mockManifest, paths: { ...mockManifest.paths } },
      isBrowser: false
    };
    module = getModule();

    withIntlProvider = module.default;

    testProps = {};
  });

  afterEach(function () {
    sinon.restore();
  });

  it('adds display name', function () {
    assume(withIntlProvider()(MockComponent)).property('displayName', 'withIntlProvider(MockComponent)');
  });

  it('hoists non-react statics', function () {
    assume(withIntlProvider()(MockComponent)).not.property('bogus');
    MockComponent.bogus = 'BOGUS';
    assume(withIntlProvider()(MockComponent)).property('bogus', 'BOGUS');
    delete MockComponent.bogus;
  });

  it('hoists getInitialProps if set', function () {
    assume(withIntlProvider()(MockComponent)).not.property('getInitialProps');
    MockComponent.getInitialProps = f => f;
    assume(withIntlProvider()(MockComponent)).property('getInitialProps');
    delete MockComponent.getInitialProps;
  });

  describe('#render', function () {
    it('wraps target component with IntlProvider and renders children', function () {
      wrapper = doMount(testProps);
      assume(wrapper.find(IntlProvider)).length(1);
      assume(wrapper.find(MockComponent)).length(1);
    });

    it('IntlProvider is passed expected default props', function () {
      wrapper = doMount(testProps);
      const result = wrapper.find(IntlProvider);
      assume(result.prop('locale')).eqls('en-US');
      assume(result.prop('messages')).eqls({});
    });

    it('IntlProvider is passed expected props from Next.js page', function () {
      testProps.pageProps = {
        localesProps: {
          locale: 'fr-FR',
          messages: {
            'fr-FR': {
              bogus: 'BOGUS'
            }
          }
        }
      };
      wrapper = doMount(testProps);
      const result = wrapper.find(IntlProvider);
      assume(result.prop('locale')).eqls('fr-FR');
      assume(result.prop('messages')).eqls({ bogus: 'BOGUS' });
    });
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
      const result = module.reducer(initState, action);
      assume(result).eqls({
        messages: { en: {
          first: 'First',
          example: 'Example'
        } },
        status: {
          '/locales/en/first.json': LOADED,
          '/locales/en.json': LOADED
        }
      });
    });

    it('ERROR actions add file status', function () {
      const action = { type: ERROR, payload: { file: '/locales/en.json' } };
      const result = module.reducer(initState, action);
      assume(result).eqls({
        messages: { en: {
          first: 'First'
        } },
        status: {
          '/locales/en/first.json': LOADED,
          '/locales/en.json': ERROR
        }
      });
    });

    it('LOADING actions add file status', function () {
      const action = { type: LOADING, payload: { file: '/locales/en.json' } };
      const result = module.reducer(initState, action);
      assume(result).eqls({
        messages: { en: {
          first: 'First'
        } },
        status: {
          '/locales/en/first.json': LOADED,
          '/locales/en.json': LOADING
        }
      });
    });
  });

  describe('init', function () {

    it('initializes state with empty objects', function () {
      const result = module.init({});
      assume(result).eqls({
        messages: {},
        status: {}
      });
    });

    it('initializes state with locales props', function () {
      const result = module.init({
        locale: 'en',
        messages: { en: { example: 'Example' } },
        status: { '/locales/en.json': LOADED }
      });
      assume(result).eqls({
        messages: { en: { example: 'Example' } },
        status: { '/locales/en.json': LOADED }
      });
    });

    it('merges locales props data with client data', function () {
      mockConfig = { isBrowser: true, clientData: {
        locale: 'en',
        messages: { en: { first: 'First' } },
        status: { '/locales/en/first.json': LOADED }
      } };

      module = getModule();

      const result = module.init({
        locale: 'en',
        messages: { en: { example: 'Example' } },
        status: { '/locales/en.json': LOADED }
      });
      assume(result).eqls({
        messages: { en: {
          first: 'First',
          example: 'Example'
        } },
        status: {
          '/locales/en/first.json': LOADED,
          '/locales/en.json': LOADED
        }
      });
    });
  });
});
