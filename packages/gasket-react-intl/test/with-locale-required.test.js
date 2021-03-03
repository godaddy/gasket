import React from 'react';
import path from 'path';
import assume from 'assume';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import { mount } from 'enzyme';
import mockManifest from './fixtures/mock-manifest.json';
import { LocaleStatus } from '../src/utils';
const { ERROR, LOADED, LOADING } = LocaleStatus;

const MockComponent = class extends React.Component {
  render() {
    return <div>MockComponent</div>;
  }
};

describe('withLocaleRequired', function () {
  let mockConfig, useLocaleRequiredStub, withLocaleRequired, wrapper;

  const doMount = (...args) => {
    const Wrapped = withLocaleRequired(...args)(MockComponent);
    return mount(<Wrapped/>);
  };

  beforeEach(function () {
    useLocaleRequiredStub = sinon.stub();
    mockConfig = {
      defaultLocale: 'en-US',
      manifest: { ...mockManifest, paths: { ...mockManifest.paths } },
      isBrowser: false
    };
    withLocaleRequired = proxyquire('../src/with-locale-required', {
      './config': mockConfig,
      './use-locale-required': {
        default: useLocaleRequiredStub
      }
    }).default;
  });

  afterEach(function () {
    sinon.restore();
  });

  it('adds display name', function () {
    assume(withLocaleRequired()(MockComponent)).property('displayName', 'withLocaleRequired(MockComponent)');
  });

  it('adds display name with ForwardRef', function () {
    assume(withLocaleRequired('locales', { forwardRef: true })(MockComponent))
      .property('displayName', 'ForwardRef(withLocaleRequired/MockComponent))');
  });

  it('hoists non-react statics', function () {
    assume(withLocaleRequired()(MockComponent)).not.property('bogus');
    MockComponent.bogus = 'BOGUS';
    assume(withLocaleRequired()(MockComponent)).property('bogus', 'BOGUS');
    delete MockComponent.bogus;
  });

  describe('#getInitialProps', function () {
    afterEach(function () {
      delete MockComponent.getInitialProps;
    });

    it('hoists getInitialProps if set', function () {
      assume(withLocaleRequired()(MockComponent)).not.property('getInitialProps');
      MockComponent.getInitialProps = sinon.stub();
      assume(withLocaleRequired()(MockComponent)).property('getInitialProps');
    });

    it('adds getInitialProps if initialProps set', function () {
      const wrapped = withLocaleRequired('locales', { initialProps: true })(MockComponent);
      assume(wrapped).property('getInitialProps');
    });

    it('executes wrapped getInitialProps', async function () {
      MockComponent.getInitialProps = sinon.stub().returns({ bogus: true });
      const wrapped = withLocaleRequired('locales', { initialProps: true })(MockComponent);

      const ctx = {};
      const props = await wrapped.getInitialProps(ctx);
      assume(MockComponent.getInitialProps).calledWith(ctx);
      assume(props).eqls({ bogus: true });
    });

    it('loads localeProps on server', async function () {
      MockComponent.getInitialProps = sinon.stub().returns({ bogus: true });
      const wrapped = withLocaleRequired('locales', { initialProps: true })(MockComponent);

      const ctx = {
        res: {
          locals: {
            localesDir: path.join(__dirname, 'fixtures', 'locales'),
            gasketData: {
              intl: {
                locale: 'fr-FR'
              }
            }
          }
        }
      };
      const props = await wrapped.getInitialProps(ctx);
      assume(MockComponent.getInitialProps).calledWith(ctx);
      assume(props).eqls({
        bogus: true,
        localesProps: {
          locale: 'fr-FR',
          messages: { 'fr-FR': { gasket_welcome: 'Bonjour!', gasket_learn: 'Apprendre Gasket' } },
          status: { '/locales/fr-FR.json': 'loaded' }
        }
      });
    });
  });

  describe('#render', function () {
    it('renders empty if loading', function () {
      useLocaleRequiredStub.returns(LOADING);
      wrapper = doMount();
      assume(wrapper.html()).falsy();
    });

    it('renders custom loader if loading', function () {
      useLocaleRequiredStub.returns(LOADING);
      wrapper = doMount('/locales', { loading: 'loading...' });
      assume(wrapper.html()).eqls('loading...');
    });

    it('renders wrapped component if LOADED', function () {
      useLocaleRequiredStub.returns(LOADED);
      wrapper = doMount({ loading: 'loading...' });
      assume(wrapper.html()).includes('MockComponent');
    });

    it('renders wrapped component if ERROR', function () {
      useLocaleRequiredStub.returns(ERROR);
      wrapper = doMount({ loading: 'loading...' });
      assume(wrapper.html()).includes('MockComponent');
    });

    it('forwards refs', function () {
      class TestComponent extends React.Component {
        // Used to test ref forwarding
        getMockData() {
          return 'MOCK_DATA';
        }

        render() {
          return (
            <span />
          );
        }
      }

      const TestWrappedComponent = withLocaleRequired('locales', { forwardRef: true })(TestComponent);

      class TestRefComponent extends React.Component {
        constructor(...args) {
          super(...args);
          this.componentRef = React.createRef();
          this.state = {
            updated: false,
            data: null
          };
        }

        componentDidMount() {
          this.setState({
            updated: true,
            data: this.componentRef.current.getMockData()
          });
        }

        render() {
          return (
            <React.Fragment>
              <TestWrappedComponent ref={ this.componentRef } />
              <span className='data'>{ this.state.data }</span>
            </React.Fragment>
          );
        }
      }

      const tree = mount(
        <TestRefComponent />
      );

      assume(tree.state('updated')).is.true();
      assume(tree.find('.data').text()).equals('MOCK_DATA');
      tree.unmount();
    });
  });
});
