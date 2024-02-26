import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import { withGasketData } from '../src';

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    // placed on context by render in next@12
    const defaultGetInitialProps = jest.fn().mockReturnValue({ html: {}, head: {}, styles: {} });
    const initialProps = await Document.getInitialProps({ ...ctx, defaultGetInitialProps });
    return { ...initialProps };
  }

  render() {
    return (
      <Html>
        <Head />
        <body>
          <Main />
          <NextScript />
          <p>some footer content</p>
        </body>
      </Html>
    );
  }
}

/**
 * Recursively searches through the rendered element tree for the first element
 * that matches the search type
 *
 * @param {object} renderedElement - The element that was rendered by the
 * component.
 * @param {string} searchType - The type of the element you're looking for.
 * @returns {object} the first element that matches the searchType.
 */
function getElementReference(renderedElement, searchType) {
  let elemRef;

  Object.keys(renderedElement).some(function (currType) {
    if (currType === 'type' && renderedElement[currType] === searchType) {
      elemRef = renderedElement;
      return true;
    }

    if (currType === 'props'
      || currType === 'children'
      || renderedElement[currType]?.props
      || renderedElement[currType]?.children
      || renderedElement[currType]?.type?.name) {
      elemRef = getElementReference(renderedElement[currType], searchType);
      return !!elemRef;
    }
  });

  return elemRef;
}

describe('withGasketData', function () {
  let WrappedDocument, mockProps, mockContext;

  beforeEach(function () {
    mockProps = {
      gasketData: {
        bogus: true
      }
    };
    mockContext = {
      renderPage: jest.fn().mockReturnValue({})
    };
  });

  describe('#getInitialProps', function () {
    it('executes parent method', async function () {
      const spy = jest.spyOn(MyDocument, 'getInitialProps');
      WrappedDocument = withGasketData()(MyDocument);

      await WrappedDocument.getInitialProps(mockContext);
      expect(spy).toHaveBeenCalledWith(mockContext);
    });

    it('adds gasketData to initial props', async function () {
      WrappedDocument = withGasketData()(MyDocument);

      const results = await WrappedDocument.getInitialProps(mockContext);
      expect(results).toHaveProperty('gasketData');

      // from parent
      expect(results).toHaveProperty('html');
      expect(results).toHaveProperty('head');
    });

    it('gasketData is empty object if no response data', async function () {
      WrappedDocument = withGasketData()(MyDocument);

      const results = await WrappedDocument.getInitialProps(mockContext);
      expect(results.gasketData).toEqual({});
    });

    it('gasketData is from res.locals', async function () {
      WrappedDocument = withGasketData()(MyDocument);
      mockContext.res = {
        locals: {
          gasketData: { bogus: true }
        }
      };

      const results = await WrappedDocument.getInitialProps(mockContext);
      expect(results.gasketData).toEqual({ bogus: true });
    });
  });

  describe('renders GasketDataScript', function () {
    // NOTE: React Testing Library is currently unable to render the Document
    // component, so we are manually traversing the WrappedDocument's render
    // output. This is not ideal and should be replaced with a better solution.
    it('in document body', function () {
      WrappedDocument = withGasketData()(Document);
      const element = new WrappedDocument();
      element.props = mockProps;

      const body = element.render().props.children[1];
      const gasketDataScript = body.props.children[1];

      expect(gasketDataScript).toBeDefined();
    });

    it('in custom document body', function () {
      WrappedDocument = withGasketData()(MyDocument);
      const element = new WrappedDocument();
      element.props = mockProps;
      const body = element.render().props.children[1];
      const gasketDataScript = body.props.children[1];

      expect(gasketDataScript).toBeDefined();
    });

    it('retains all original content', function () {
      WrappedDocument = withGasketData()(MyDocument);
      const element = new WrappedDocument();
      element.props = mockProps;
      const html = element.render();
      const head = html.props.children[0];
      const body = getElementReference(html, 'body');
      const main = body.props.children[0];
      const gasketDataScript = body.props.children[1];
      const nextScript = body.props.children[1];

      expect(gasketDataScript).toBeDefined();

      // from parent
      expect(html).toBeDefined();
      expect(head).toBeDefined();
      expect(main).toBeDefined();
      expect(nextScript).toBeDefined();
      expect(getElementReference(html, 'p')).toBeDefined();
    });

    it('between Main and NextScript', function () {
      WrappedDocument = withGasketData()(MyDocument);
      const element = new WrappedDocument();
      element.props = mockProps;
      const body = getElementReference(element.render(), 'body');

      expect(body.props.children[0].type.name).toEqual('Main');
      expect(body.props.children[1].type.name).toEqual('GasketDataScript');
      expect(body.props.children[2].type.name).toEqual('NextScript');
    });

    it('before other body scripts', function () {
      class MyDocumentWithScript extends Document {
        static async getInitialProps(ctx) {
          const initialProps = await Document.getInitialProps(ctx);
          return { ...initialProps };
        }

        render() {
          return (
            <Html>
              <Head />
              <body>
                <div />
                <script id='CustomScript' />
                <NextScript />
              </body>
            </Html>
          );
        }
      }

      WrappedDocument = withGasketData()(MyDocumentWithScript);
      const element = new WrappedDocument();
      element.props = mockProps;
      const body = getElementReference(element.render(), 'body');

      expect(body.props.children[0].type).toEqual('div');
      expect(body.props.children[1].type.name).toEqual('GasketDataScript');
      expect(body.props.children[2].type).toEqual('script');
      expect(body.props.children[3].type.name).toEqual('NextScript');
    });

    it('after first element (expect to be wrapping Main)', function () {
      class MyDocumentWithScript extends Document {
        static async getInitialProps(ctx) {
          const initialProps = await Document.getInitialProps(ctx);
          return { ...initialProps };
        }

        render() {
          return (
            <Html>
              <Head />
              <body>
                <div id='SomethingWrappingMain'>
                  <Main />
                </div>
                <div id='SomethingWrappingNextScript'>
                  <NextScript />
                </div>
              </body>
            </Html>
          );
        }
      }

      WrappedDocument = withGasketData()(MyDocumentWithScript);
      const element = new WrappedDocument();
      element.props = mockProps;
      const body = getElementReference(element.render(), 'body');

      expect(body.props.children[0].type).toEqual('div');
      expect(body.props.children[1].type.name).toEqual('GasketDataScript');
      expect(body.props.children[2].type).toEqual('div');
    });

    it('at forced index set in options', function () {
      class MyDocumentWithScript extends Document {
        static async getInitialProps(ctx) {
          const initialProps = await Document.getInitialProps(ctx);
          return { ...initialProps };
        }

        render() {
          return (
            <Html>
              <Head />
              <body>
                <header />
                <Main />
                <script />
                <div />
                <footer />
                <NextScript />
              </body>
            </Html>
          );
        }
      }

      WrappedDocument = withGasketData({ index: 4 })(MyDocumentWithScript);
      const element = new WrappedDocument();
      element.props = mockProps;
      const body = getElementReference(element.render(), 'body');

      expect(body.props.children[0].type).toEqual('header');
      expect(body.props.children[1].type.name).toEqual('Main');
      expect(body.props.children[2].type).toEqual('script');
      expect(body.props.children[3].type).toEqual('div');
      expect(body.props.children[4].type.name).toEqual('GasketDataScript');
      expect(body.props.children[5].type).toEqual('footer');
      expect(body.props.children[6].type.name).toEqual('NextScript');
    });
  });
});
