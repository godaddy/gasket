import React from 'react';
import assume from 'assume';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import { mount } from 'enzyme';
import { IntlProvider } from 'react-intl';
import mockManifest from './fixtures/mock-manifest.json';

const MockComponent = class extends React.Component {
  render() {
    return <div>MockComponent</div>;
  }
};

describe('withIntlProvider', function () {
  let mockConfig, withIntlProvider, wrapper, testProps;

  const doMount = props => {
    const Wrapped = withIntlProvider()(MockComponent);
    return mount(<Wrapped { ...props } />);
  };

  beforeEach(function () {
    mockConfig = {
      defaultLocale: 'en-US',
      manifest: { ...mockManifest, paths: { ...mockManifest.paths } },
      isBrowser: false
    };
    withIntlProvider = proxyquire('../src/with-intl-provider', {
      './config': mockConfig,
      './utils': proxyquire('../src/utils', {
        './config': mockConfig
      })
    }).default;

    testProps = {};
  });

  afterEach(function () {
    sinon.restore();
  });

  it('adds display name', function () {
    assume(withIntlProvider()(MockComponent)).property('displayName', 'withIntlProvider(MockComponent)');
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
});
