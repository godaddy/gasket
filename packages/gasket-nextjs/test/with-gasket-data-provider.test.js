import { jest, expect } from '@jest/globals';
import { createElement } from 'react';
import { render } from '@testing-library/react';
import { withGasketDataProvider } from '../lib/with-gasket-data-provider.js';

// eslint-disable-next-line no-console
const consoleError = console.error;
// ignore known act() warnings
jest.spyOn(console, 'error').mockImplementation((msg) => {
  if (msg.includes('ReactDOMTestUtils.act')) return;
  consoleError(msg);
});

const mockGasketData = jest.fn();
jest.unstable_mockModule('@gasket/data', () => ({ gasketData: mockGasketData }));


describe('withGasketDataProvider', function () {

  afterEach(() => {
    mockGasketData.mockReturnValue();
    jest.resetModules();
  });

  it('should render the component', () => {
    const HocComponent = withGasketDataProvider()(() => createElement('div'));
    const container = render(createElement(HocComponent));

    expect(container).toBeDefined();
  });

  it('should inject gasketData when client side', async () => {
    mockGasketData.mockReturnValue({ test: 'hello' });
    const HocComponent = withGasketDataProvider()(({ children }) => createElement('div', null, children));
    const intPropsResponse = await HocComponent.getInitialProps({});
    expect(intPropsResponse).toEqual({ gasketData: { test: 'hello' } });
  });


  it('should inject gasketData when SSR', async () => {
    const serverTestData = { test: 'hello world' };

    const Component = ({ children }) => createElement('div', null, children);

    const HocComponent = withGasketDataProvider()(Component);
    const intPropsResponse = await HocComponent.getInitialProps({ ctx: { res: { locals: { gasketData: serverTestData } } } });

    expect(intPropsResponse).toEqual({ gasketData: serverTestData });
  });


  it('should call wrappedComponents getInitialProps', async () => {
    const serverTestData = { test: 'hello world' };
    const intProps = { called: true };

    const Component = ({ children }) => createElement('div', null, children);
    Component.getInitialProps = async () => (intProps);

    const HocComponent = withGasketDataProvider()(Component);
    const intPropsResponse = await HocComponent.getInitialProps({ ctx: { res: { locals: { gasketData: serverTestData } } } });

    expect(intPropsResponse).toEqual({ ...intProps, gasketData: serverTestData });
  });
});
