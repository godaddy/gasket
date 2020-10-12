import React from 'react';
import assume from 'assume';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import { mount } from 'enzyme';
import { IntlProvider } from 'react-intl';
import { ERROR, LOADED } from '../src/utils';

const fetchStub = sinon.stub();
const mockManifest = require('./fixtures/mock-manifest.json');
const mockConfig = {};

const MockComponent = class extends React.Component {
  render() {
    return <div>MockComponent</div>;
  }
};

const getMod = () => proxyquire('../src/components', {
  './config': mockConfig,
  '@gasket/fetch': fetchStub
});

describe('React components', function () {
  let mod;

  beforeEach(function () {
    mockConfig.defaultLocale = 'en-US';
    mockConfig.manifest = { ...mockManifest, paths: { ...mockManifest.paths } };
    mockConfig.isBrowser = false;
    mod = getMod();
  });

  afterEach(function () {
    sinon.restore();
  });

  describe('withIntlProvider', function () {
    let Component, wrapper, testProps;

    beforeEach(function () {
      Component = mod.withIntlProvider()(MockComponent);
      testProps = {};
    });

    it('adds display name', function () {
      assume(Component).property('displayName', 'withIntlProvider(MockComponent)');
    });

    describe('#render', function () {
      it('wraps target component with IntlProvider and renders children', function () {
        wrapper = mount(<Component { ...testProps } />);
        assume(wrapper.find(IntlProvider)).length(1);
        assume(wrapper.find(MockComponent)).length(1);
      });

      it('IntlProvider is passed expected default props', function () {
        wrapper = mount(<Component { ...testProps } />);
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
        wrapper = mount(<Component { ...testProps } />);
        const result = wrapper.find(IntlProvider);
        assume(result.prop('locale')).eqls('fr-FR');
        assume(result.prop('messages')).eqls({ bogus: 'BOGUS' });
      });
    });
  });

  describe('withLocaleRequired', function () {
    let Component, wrapper, testProps;

    beforeEach(function () {
      Component = mod.withLocaleRequired()(MockComponent);
      testProps = {};
    });

    it('adds display name', function () {
      assume(Component).property('displayName', 'withLocaleRequired(MockComponent)');
    });

    describe('#render', function () {
      it('renders null if loading', function () {
        wrapper = mount(<Component { ...testProps } />);
        assume(wrapper.html()).eqls(null);
      });

      it('renders custom loader if loading', function () {
        Component = mod.withLocaleRequired('/locales', { loading: 'loading...' })(MockComponent);
        wrapper = mount(<Component { ...testProps } />);
        assume(wrapper.html()).eqls('loading...');
      });

      it('renders wrapped component if LOADED', function () {
        sinon.stub(mod.helpers, 'useGasketIntl').returns(LOADED);
        Component = mod.withLocaleRequired('/locales')(MockComponent);
        wrapper = mount(<Component { ...testProps } />);
        assume(wrapper.html()).includes('MockComponent');
      });

      it('renders wrapped component if ERROR', function () {
        sinon.stub(mod.helpers, 'useGasketIntl').returns(ERROR);
        Component = mod.withLocaleRequired('/locales')(MockComponent);
        wrapper = mount(<Component { ...testProps } />);
        assume(wrapper.html()).includes('MockComponent');
      });
    });
  });

  describe('LocaleRequired', function () {
    let wrapper;

    const doMount = props => mount(<mod.LocaleRequired { ...props }>MockComponent</mod.LocaleRequired>);

    describe('#render', function () {
      it('renders null if loading', function () {
        wrapper = doMount({});
        assume(wrapper.html()).eqls(null);
      });

      it('renders custom loader if loading', function () {
        wrapper = doMount({ loading: 'loading...' });
        assume(wrapper.html()).eqls('loading...');
      });

      it('renders wrapped component if LOADED', function () {
        sinon.stub(mod.helpers, 'useGasketIntl').returns(LOADED);
        wrapper = doMount({ loading: 'loading...' });
        assume(wrapper.html()).includes('MockComponent');
      });

      it('renders wrapped component if ERROR', function () {
        sinon.stub(mod.helpers, 'useGasketIntl').returns(ERROR);
        wrapper = doMount({ loading: 'loading...' });
        assume(wrapper.html()).includes('MockComponent');
      });
    });
  });
});
