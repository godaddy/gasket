/** @jest-environment node */


import { createElement } from 'react';

// eslint-disable-next-line no-console
const consoleError = console.error;
// ignore known act() warnings
vi.spyOn(console, 'error').mockImplementation((msg) => {
  if (msg.includes('ReactDOMTestUtils.act')) return;
  consoleError(msg);
});

const { withGasketDataProvider } = await import('../lib/with-gasket-data-provider.js');

describe('withGasketDataProvider', function () {
  let mockGasket;

  beforeEach(() => {
    mockGasket = { actions: { getPublicGasketData: vi.fn() } };
  });

  afterEach(() => {
    vi.resetModules();
  });

  it('should inject gasketData when SSR', async () => {
    const testData = { test: 'hello world' };
    mockGasket.actions.getPublicGasketData.mockReturnValue(testData);
    const MockComponent = ({ children }) => createElement('div', null, children);
    const HocComponent = withGasketDataProvider(mockGasket)(MockComponent);
    const results = await HocComponent.getInitialProps({ ctx: { req: {} } });

    expect(results).toEqual({ gasketData: testData });
  });


  it('should call wrappedComponents getInitialProps', async () => {
    const testData = { test: 'hello world' };
    mockGasket.actions.getPublicGasketData.mockReturnValue(testData);
    const intProps = { called: true };

    const Component = ({ children }) => createElement('div', null, children);
    Component.getInitialProps = async () => (intProps);

    const HocComponent = withGasketDataProvider(mockGasket)(Component);
    const results = await HocComponent.getInitialProps({ ctx: { req: {} } });

    expect(results).toEqual({
      ...intProps,
      gasketData: testData
    });
  });
});
