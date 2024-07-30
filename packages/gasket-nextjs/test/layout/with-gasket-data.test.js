import { jest, expect } from '@jest/globals';
import { createElement, Children } from 'react';

jest.unstable_mockModule('../../lib/server/request.js', () => ({
  request: jest.fn().mockReturnValue({})
}));

describe('withGasketData', () => {
  let mockGasket, mockPublicGasketData, mockLayout, layout;

  beforeAll(async () => {
    layout = (await import('../../lib/layout/with-gasket-data.js'));
  });

  beforeEach(async () => {
    mockPublicGasketData = { foo: 'bar' };
    mockGasket = {
      actions: {
        getPublicGasketData: jest.fn(() => mockPublicGasketData)
      }
    };

    const Html = (props) => createElement('html', { ...props });
    const Main = (props) => createElement('main', { ...props });
    const Head = (props) => createElement('head', { ...props });
    const NextScript = (props) => createElement('script', { 'data-testid': 'next-script', ...props });

    // eslint-disable-next-line jsdoc/require-jsdoc
    function createMockElements() {
      return (
        createElement(Html, null,
          createElement(Head, null),
          createElement('body', null,
            createElement(Main, null),
            createElement(NextScript, null),
            createElement('p', null, 'some footer content')
          )
        )
      );
    }

    mockLayout = createMockElements;
  });

  it('should return a function', () => {
    const enhancedLayout = layout.withGasketData(mockGasket);
    expect(typeof enhancedLayout).toBe('function');
  });

  it('should inject Gasket data into the body children', async () => {
    const enhancedLayout = layout.withGasketData(mockGasket)(mockLayout);
    const result = await enhancedLayout();
    const body = result.props.children[1];
    const bodyChildren = body.props.children;
    const childrenArray = Children.toArray(bodyChildren);
    const script = childrenArray.find(o => o.type.name === 'GasketDataScript');
    expect(script.props.data).toEqual(mockPublicGasketData);
  });

  it('should inject gasketData script into the body at a particular index', async () => {
    const mockIndex = 2;
    const enhancedLayout = layout.withGasketData(mockGasket, { index: mockIndex })(mockLayout);
    const result = await enhancedLayout();
    const body = result.props.children[1];
    const bodyChildren = body.props.children;
    const childrenArray = Children.toArray(bodyChildren);
    const resultIndex = childrenArray.findIndex(child => child.type.name === 'GasketDataScript');
    expect(resultIndex).toEqual(mockIndex);
  });
});
