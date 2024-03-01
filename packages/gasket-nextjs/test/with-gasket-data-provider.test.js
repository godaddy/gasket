import React from 'react';;
import { render } from '@testing-library/react';

describe('withGasketDataProvider', function () {

  const setup = (mockData = {}) => {
    jest.mock('@gasket/data', () => mockData);
    const { withGasketDataProvider } = require('../src/with-gasket-data-provider');
    return { withGasketDataProvider };
  };

  afterEach(() => {
    jest.resetModules();
  });

  it('should render the component', () => {
    const { withGasketDataProvider } = setup();
    const HocComponent = withGasketDataProvider()(() => <div />);
    const container = render(<HocComponent />);

    expect(container).toBeDefined();
  });

  it('should inject gasketData when client side', async () => {
    const { withGasketDataProvider } = setup({ test: 'hello' });
    const HocComponent = withGasketDataProvider()(({ children }) => <div>{children}</div>);
    const intPropsResponse = await HocComponent.getInitialProps({});
    expect(intPropsResponse).toEqual({ gasketData: { test: 'hello' } });
  });


  it('should inject gasketData when SSR', async () => {
    const { withGasketDataProvider } = setup();
    const serverTestData = { test: 'hello world' };

    // eslint-disable-next-line react/prop-types
    const Component = ({ children }) => <div>{children}</div>;

    const HocComponent = withGasketDataProvider()(Component);
    const intPropsResponse = await HocComponent.getInitialProps({ ctx: { res: { locals: { gasketData: serverTestData } } } });

    expect(intPropsResponse).toEqual({ gasketData: serverTestData });
  });


  it('should call wrappedComponents getInitialProps', async () => {
    const { withGasketDataProvider } = setup();

    const serverTestData = { test: 'hello world' };
    const intProps = { called: true };

    // eslint-disable-next-line react/prop-types
    const Component = ({ children }) => <div>{children}</div>;
    Component.getInitialProps = async () => (intProps);

    const HocComponent = withGasketDataProvider()(Component);
    const intPropsResponse = await HocComponent.getInitialProps({ ctx: { res: { locals: { gasketData: serverTestData } } } });

    expect(intPropsResponse).toEqual({ ...intProps, gasketData: serverTestData });
  });
});
