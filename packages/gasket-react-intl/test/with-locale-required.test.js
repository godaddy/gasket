import React from 'react';
import path from 'path';
import assume from 'assume';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import { render, screen } from '@testing-library/react';
import mockManifest from './fixtures/mock-manifest.json';
import { LocaleStatus } from '../src/utils';
const { ERROR, LOADED, LOADING } = LocaleStatus;
const loadingText = 'loading...';

const MockComponent = class extends React.Component {
  render() {
    return <div>MockComponent</div>;
  }
};

describe('withLocaleRequired', function () {
  let mockConfig, useLocaleRequiredStub, withLocaleRequired, wrapper;

  const doMount = (...args) => {
    const Wrapped = withLocaleRequired(...args)(MockComponent);
    return render(<Wrapped/>);
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
    assume(withLocaleRequired('/locales', { forwardRef: true })(MockComponent))
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
      const wrapped = withLocaleRequired('/locales', { initialProps: true })(MockComponent);
      assume(wrapped).property('getInitialProps');
    });

    it('executes wrapped getInitialProps', async function () {
      MockComponent.getInitialProps = sinon.stub().returns({ bogus: true });
      const wrapped = withLocaleRequired('/locales', { initialProps: true })(MockComponent);

      const ctx = {};
      const props = await wrapped.getInitialProps(ctx);
      assume(MockComponent.getInitialProps).calledWith(ctx);
      assume(props).eqls({ bogus: true });
    });

    it('loads localeProps on server', async function () {
      MockComponent.getInitialProps = sinon.stub().returns({ bogus: true });
      const wrapped = withLocaleRequired('/locales', { initialProps: true })(MockComponent);

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

    it('handles missing gasketData', async function () {
      MockComponent.getInitialProps = sinon.stub().returns({ bogus: true });
      const wrapped = withLocaleRequired('/locales', { initialProps: true })(MockComponent);

      const ctx = {
        res: {
          locals: {
            localesDir: path.join(__dirname, 'fixtures', 'locales')
          }
        }
      };

      let error = null;
      try {
        await wrapped.getInitialProps(ctx);
      } catch (err) {
        error = err;
      }
      assume(error).to.equal(null);
    });

    it('resolve localePahThunk and passes as prop', async function () {
      const mockThunk = sinon.stub().callsFake((context) => context.extra ? '/locales/extra' : '/locales');
      MockComponent.getInitialProps = sinon.stub().returns({ bogus: true });
      const wrapped = withLocaleRequired(mockThunk, { initialProps: true })(MockComponent);

      const ctx = {
        extra: true,
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
        localePathPart: '/locales/extra',
        bogus: true,
        localesProps: {
          locale: 'fr-FR',
          messages: { 'fr-FR': { gasket_extra: 'Supplémentaire' } },
          status: { '/locales/extra/fr-FR.json': 'loaded' }
        }
      });
    });
  });

  describe('#render', function () {
    it('renders empty if loading', function () {
      useLocaleRequiredStub.returns(LOADING);
      wrapper = doMount();
      assume(wrapper.baseElement.innerHTML).eqls('<div></div>');
    });

    it('renders custom loader if loading', async function () {
      useLocaleRequiredStub.returns(LOADING);
      doMount('/locales', { loading: loadingText });
      const textEl = await screen.findByText(loadingText);
      assume(textEl.innerHTML).eqls(loadingText);
    });

    it('renders wrapped component if LOADED', async function () {
      useLocaleRequiredStub.returns(LOADED);
      doMount({ loading: loadingText });
      const textEl = await screen.findByText('MockComponent');
      assume(textEl.innerHTML).eqls('MockComponent');
    });

    it('renders wrapped component if ERROR', async function () {
      useLocaleRequiredStub.returns(ERROR);
      doMount({ loading: loadingText });
      const textEl = await screen.findByText('MockComponent');
      assume(textEl.innerHTML).eqls('MockComponent');
    });

    it('forwards refs', async function () {
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

      const TestWrappedComponent = withLocaleRequired('/locales', { forwardRef: true })(TestComponent);

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
              <span data-testid='data'>{ this.state.data }</span>
            </React.Fragment>
          );
        }
      }

      render(<TestRefComponent />);

      const element = await screen.getByTestId('data');

      assume(element.innerHTML).equals('MOCK_DATA');
    });
  });
});
