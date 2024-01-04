import React from 'react';
import path from 'path';
import { render, screen } from '@testing-library/react';
import { LocaleStatus } from '../src/utils';
import withLocaleRequired from '../src/with-locale-required';

jest.mock('../src/use-locale-required', () => jest.fn());

const { ERROR, LOADED, LOADING } = LocaleStatus;
const loadingText = 'loading...';

const MockComponent = class extends React.Component {
  render() {
    return <div>MockComponent</div>;
  }
};

describe('withLocaleRequired', function () {
  let useLocaleRequiredMock, wrapper;

  const doMount = (...args) => {
    const Wrapped = withLocaleRequired(...args)(MockComponent);
    return render(<Wrapped />);
  };

  beforeEach(function () {
    useLocaleRequiredMock = require('../src/use-locale-required');
  });

  afterEach(function () {
    jest.restoreAllMocks();
  });

  it('adds display name', function () {
    const wrapped = withLocaleRequired()(MockComponent);
    expect(wrapped.displayName).toBe('withLocaleRequired(MockComponent)');
  });

  it('adds display name with ForwardRef', function () {
    const wrapped = withLocaleRequired('/locales', { forwardRef: true })(MockComponent);
    expect(wrapped.displayName).toBe('ForwardRef(withLocaleRequired/MockComponent))');
  });

  it('hoists non-react statics', function () {
    const wrapped = withLocaleRequired()(MockComponent);
    expect(wrapped).not.toHaveProperty('bogus');
    MockComponent.bogus = 'BOGUS';
    const wrappedBogus = withLocaleRequired()(MockComponent);
    expect(wrappedBogus).toHaveProperty('bogus', 'BOGUS');
    delete MockComponent.bogus;
  });

  describe('#getInitialProps', function () {
    afterEach(function () {
      delete MockComponent.getInitialProps;
    });

    it('hoists getInitialProps if set', function () {
      const wrapped = withLocaleRequired()(MockComponent);
      expect(wrapped).not.toHaveProperty('getInitialProps');
      MockComponent.getInitialProps = jest.fn();
      const wrappedGetInitialProps = withLocaleRequired()(MockComponent);
      expect(wrappedGetInitialProps).toHaveProperty('getInitialProps');
    });

    it('adds getInitialProps if initialProps set', function () {
      const wrapped = withLocaleRequired('/locales', { initialProps: true })(MockComponent);
      expect(wrapped).toHaveProperty('getInitialProps');
    });

    it('executes wrapped getInitialProps', async function () {
      MockComponent.getInitialProps = jest.fn().mockResolvedValue({ bogus: true });
      const wrapped = withLocaleRequired('/locales', { initialProps: true })(MockComponent);
      const ctx = {};
      const props = await wrapped.getInitialProps(ctx);
      expect(MockComponent.getInitialProps).toHaveBeenCalledWith(ctx);
      expect(props).toEqual({ bogus: true });
    });

    it('loads localeProps on server', async function () {
      MockComponent.getInitialProps = jest.fn().mockResolvedValue({ bogus: true });
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
      expect(MockComponent.getInitialProps).toHaveBeenCalledWith(ctx);
      expect(props).toEqual({
        bogus: true,
        localesProps: {
          locale: 'fr-FR',
          messages: { 'fr-FR': { gasket_welcome: 'Bonjour!', gasket_learn: 'Apprendre Gasket' } },
          status: { '/locales/fr-FR.json': 'loaded' }
        }
      });
    });

    it('handles missing gasketData', async function () {
      MockComponent.getInitialProps = jest.fn().mockResolvedValue({ bogus: true });
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
      expect(error).toBe(null);
    });

    it('resolve localePahThunk and passes as prop', async function () {
      const mockThunk = jest.fn().mockImplementation((context) => (context.extra ? '/locales/extra' : '/locales'));
      MockComponent.getInitialProps = jest.fn().mockResolvedValue({ bogus: true });
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
      expect(MockComponent.getInitialProps).toHaveBeenCalledWith(ctx);
      expect(props).toEqual({
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
      useLocaleRequiredMock.mockReturnValue(LOADING);  // Set the mock return value to LOADING;
      wrapper = doMount();
      expect(wrapper.baseElement.innerHTML).toEqual('<div></div>');
    });

    it('renders custom loader if loading', async function () {
      useLocaleRequiredMock.mockReturnValue(LOADING);
      doMount('/locales', { loading: loadingText });
      const textEl = await screen.findByText(loadingText);
      expect(textEl.innerHTML).toEqual(loadingText);
    });

    it('renders wrapped component if LOADED', async function () {
      useLocaleRequiredMock.mockReturnValue(LOADED);
      doMount({ loading: loadingText });
      const textEl = await screen.findByText('MockComponent');
      expect(textEl.innerHTML).toEqual('MockComponent');
    });

    it('renders wrapped component if ERROR', async function () {
      useLocaleRequiredMock.mockReturnValue(ERROR);
      doMount({ loading: loadingText });
      const textEl = await screen.findByText('MockComponent');
      expect(textEl.innerHTML).toEqual('MockComponent');
    });

    it('forwards refs', async function () {
      class TestComponent extends React.Component {
        // Used to test ref forwarding
        getMockData() {
          return 'MOCK_DATA';
        }

        render() {
          return <span />;
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
              <span data-testid='data'>{this.state.data}</span>
            </React.Fragment>
          );
        }
      }

      render(<TestRefComponent />);
      const element = await screen.getByTestId('data');
      expect(element.innerHTML).toEqual('MOCK_DATA');
    });
  });
});
