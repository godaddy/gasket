import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { render } from '@testing-library/react';
import { GasketDataProvider, useGasketData } from '../src';

type ChildrenProps = {
  children: React.FC
}

describe('GasketDataReact', function () {

  const setup = (testData = {}) => {
    jest.mock('@gasket/data', () => testData);
    const { withGasketData } = require('../src');

    return { withGasketData };
  };

  beforeEach(() => {
    jest.resetModules();
  });

  it('should render the component', () => {
    const { withGasketData } = setup();
    const HocComponent = withGasketData(() => <div/>);
    const { container } = render(
      <HocComponent/>
    );
    expect(container).not.toBe(null);
  });


  it('should return gasketData', async () => {
    const testData = { test: 'hello' };

    const { result } = renderHook(() => useGasketData(), {
      wrapper({ children }: ChildrenProps) {
        return <GasketDataProvider gasketData={testData}>{children}</GasketDataProvider>;
      }
    });

    expect(result.current).toBe(testData);
  });


  it('should inject gasketData when client side', async () => {
    const testData = { test: 'hello' };
    const { withGasketData } = setup(testData);

    const HocComponent = withGasketData(({ children }: ChildrenProps) => <div>{children}</div>);
    const intPropsResponse = await HocComponent.getInitialProps({});

    expect(intPropsResponse).toEqual({ gasketData: testData });
  });


  it('should inject gasketData when SSR', async () => {
    const { withGasketData } = setup();
    const serverTestData = { test: 'hello world' };

    const Component = ({ children }: ChildrenProps) => <div>{children}</div>;

    const HocComponent = withGasketData(Component);
    const intPropsResponse = await HocComponent.getInitialProps({ ctx: { res: { locals: { gasketData: serverTestData } } } });

    expect(intPropsResponse).toEqual({ gasketData: serverTestData });
  });


  it('should call wrappedComponents getInitialProps', async () => {
    const { withGasketData } = setup();

    const serverTestData = { test: 'hello world' };
    const intProps = { called: true };

    const Component = ({ children }: ChildrenProps) => <div>{children}</div>;
    Component.getInitialProps = async () => (intProps);

    const HocComponent = withGasketData(Component);
    const intPropsResponse = await HocComponent.getInitialProps({ ctx: { res: { locals: { gasketData: serverTestData } } } });

    expect(intPropsResponse).toEqual({ ...intProps, gasketData: serverTestData });
  });


});
