import { expect } from '@jest/globals';
import { createElement, Children } from 'react';
import { injectGasketData } from '../lib/inject-gasket-data.js';

describe('injectGasketData', function () {
  let mockGasketData, mockHtml;

  beforeEach(function () {

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


    mockGasketData = { foo: 'bar' };
    mockHtml = createMockElements();
  });

  it('should inject gasketData script into the body', function () {
    const injected = injectGasketData(mockHtml, mockGasketData, () => 1);
    const body = injected.props.children[1];
    const bodyChildren = body.props.children;
    const childrenArray = Children.toArray(bodyChildren);
    const script = childrenArray.find(o => o.type.name === 'GasketDataScript');
    expect(script.props.data).toEqual(mockGasketData);
  });

  it('should inject gasketData script into the body at a particular index', function () {
    const mockIndex = 2;
    const injected = injectGasketData(mockHtml, mockGasketData, (c, i) => i, mockIndex);
    const body = injected.props.children[1];
    const bodyChildren = body.props.children;
    const childrenArray = Children.toArray(bodyChildren);
    const resultIndex = childrenArray.findIndex(child => child.type.name === 'GasketDataScript');
    expect(resultIndex).toEqual(mockIndex);
  });
});

