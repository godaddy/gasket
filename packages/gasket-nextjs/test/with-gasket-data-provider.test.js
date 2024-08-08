/** @jest-environment jsdom */ // eslint-disable-line

import { jest, expect } from '@jest/globals';
import { createElement } from 'react';
import { render } from '@testing-library/react';


// eslint-disable-next-line no-console
const consoleError = console.error;
// ignore known act() warnings
jest.spyOn(console, 'error').mockImplementation((msg) => {
  if (msg.includes('ReactDOMTestUtils.act')) return;
  consoleError(msg);
});

const mockResolveGasketData = jest.fn();
jest.unstable_mockModule('@gasket/data', () => ({ resolveGasketData: mockResolveGasketData }));

const { withGasketDataProvider } = await import('../lib/with-gasket-data-provider.js');

describe('withGasketDataProvider', function () {
  let mockGasket;

  beforeEach(() => {
    mockGasket = { actions: { getPublicGasketData: jest.fn() } };
  });

  afterEach(() => {
    mockResolveGasketData.mockResolvedValue();
    jest.resetModules();
  });

  it('should inject gasketData when client side', async () => {
    const testData = { test: 'hello world' };
    mockResolveGasketData.mockResolvedValue(testData);
    const MockComponent = ({ children }) => createElement('div', null, children);
    const HocComponent = withGasketDataProvider(mockGasket)(MockComponent);
    const results = await HocComponent.getInitialProps({});

    expect(results).toEqual({ gasketData: testData });
  });


  it('should call wrappedComponents getInitialProps', async () => {
    const testData = { test: 'hello world' };
    mockResolveGasketData.mockResolvedValue(testData);
    const intProps = { called: true };

    const Component = ({ children }) => createElement('div', null, children);
    Component.getInitialProps = async () => (intProps);

    const HocComponent = withGasketDataProvider(mockGasket)(Component);
    const results = await HocComponent.getInitialProps({});
    expect(results).toEqual({
      ...intProps,
      gasketData: testData
    });
  });

  it('should render the component', () => {
    const HocComponent = withGasketDataProvider(mockGasket)(() => createElement('div'));
    const container = render(createElement(HocComponent));

    expect(container).toBeDefined();
  });
});
