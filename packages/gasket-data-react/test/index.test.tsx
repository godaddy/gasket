import React from 'react';

/**
 * Must be before all other imports
 */
const testData = { test: 'hello' };
jest.mock('@gasket/data', () => testData);
/**
 *
 */

import { useGasketData, withGasketData } from '../src';
import { renderHook } from '@testing-library/react-hooks';
import { render } from '@testing-library/react';
import { GasketDataProvider } from '../src/GasketDataProvider';

type ChildrenProps = {
  children: React.FC
}

describe('GasketDataReact', function () {

  it('should render the component', () => {
    const HocComponent = withGasketData(() => <div/>);
    const { container } = render(
      <HocComponent/>
    );
    expect(container).not.toBe(null);
  });


  it('should return gasketData', () => {
    const { result } = renderHook(() => useGasketData(), {
      wrapper({ children }: ChildrenProps) {
        return <GasketDataProvider data={testData}>{children}</GasketDataProvider>;
      }
    });

    expect(result.current).toBe(testData);
  });


  it('should inject gasketData when client side', () => {
    const HocComponent = withGasketData(({ children }) => <div>{children}</div>);

    const { result } = renderHook(() => useGasketData(), {
      wrapper({ children }: ChildrenProps) {
        return <HocComponent>{children}</HocComponent>;
      }
    });

    expect(result.current).toBe(testData);
  });


  it('should inject gasketData when SSR', async () => {
    const serverTestData = { test: 'hello world' };

    const Component = ({ children }: ChildrenProps) => <div>{children}</div>;

    const HocComponent = withGasketData(Component);
    const intPropsResponse = await HocComponent.getInitialProps({ ctx: { res: { locals: { gasketData: serverTestData } } } });

    const { result } = renderHook(() => useGasketData(), {
      wrapper({ children }: ChildrenProps) {
        return <HocComponent>{children}</HocComponent>;
      }
    });

    expect(result.current).toBe(serverTestData);
    expect(intPropsResponse).toEqual({});
  });


  it('should call wrappedComponents getInitialProps', async () => {
    const serverTestData = { test: 'hello world' };
    const intProps = { called: true };

    const Component = ({ children }: ChildrenProps) => <div>{children}</div>;
    Component.getInitialProps = async () => (intProps);

    const HocComponent = withGasketData(Component);
    const intPropsResponse = await HocComponent.getInitialProps({ ctx: { res: { locals: { gasketData: serverTestData } } } });

    const { result } = renderHook(() => useGasketData(), {
      wrapper({ children }: ChildrenProps) {
        return <HocComponent>{children}</HocComponent>;
      }
    });

    expect(result.current).toBe(serverTestData);
    expect(intPropsResponse).toBe(intProps);
  });


});
