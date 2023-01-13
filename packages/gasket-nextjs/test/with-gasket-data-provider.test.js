import React from 'react';
import { render } from '@testing-library/react';
import assume from 'assume';
import decache from 'decache';
import mock from 'mock-require';

describe('withGasketDataProvider', function () {

  const setup = (testData = {}) => {
    mock('@gasket/data', testData);
    const { withGasketDataProvider } = require('../src/with-gasket-data-provider');
    return { withGasketDataProvider };
  };

  beforeEach(() => {
    decache('../src/with-gasket-data-provider');
  });

  it('should render the component', () => {
    const { withGasketDataProvider } = setup();
    const HocComponent = withGasketDataProvider()(() => <div/>);
    const container = render(<HocComponent/>);

    assume(container).exists();
  });

  it('should inject gasketData when client side', async () => {
    const testData = { test: 'hello' };
    const { withGasketDataProvider } = setup(testData);

    const HocComponent = withGasketDataProvider()(({ children }) => <div>{children}</div>);
    const intPropsResponse = await HocComponent.getInitialProps({});

    assume(intPropsResponse).eql({ gasketData: testData });
  });


  it('should inject gasketData when SSR', async () => {
    const { withGasketDataProvider } = setup();
    const serverTestData = { test: 'hello world' };

    // eslint-disable-next-line react/prop-types
    const Component = ({ children }) => <div>{children}</div>;

    const HocComponent = withGasketDataProvider()(Component);
    const intPropsResponse = await HocComponent.getInitialProps({ ctx: { res: { locals: { gasketData: serverTestData } } } });

    assume(intPropsResponse).eql({ gasketData: serverTestData });
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

    assume(intPropsResponse).eql({ ...intProps, gasketData: serverTestData });
  });
});
