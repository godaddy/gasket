import React from 'react';
import assume from 'assume';
import sinon from 'sinon';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import { withGasketData } from '../src';

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    // placed on context by render in next@12
    const defaultGetInitialProps = sinon.stub().returns({ html: {}, head: {}, styles: {} });
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
 * @param renderedElement - The element that was rendered by the component.
 * @param searchType - The type of the element you're looking for.
 * @returns the first element that matches the searchType.
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
      renderPage: sinon.stub().returns({})
    };
  });

  afterEach(function () {
    sinon.restore();
  });

  describe('#getInitialProps', function () {
    it('executes parent method', async function () {
      const spy = sinon.spy(MyDocument, 'getInitialProps');
      WrappedDocument = withGasketData()(MyDocument);

      await WrappedDocument.getInitialProps(mockContext);
      assume(spy).calledWith(mockContext);
    });

    it('adds gasketData to initial props', async function () {
      WrappedDocument = withGasketData()(MyDocument);

      const results = await WrappedDocument.getInitialProps(mockContext);
      assume(results).property('gasketData');

      // from parent
      assume(results).property('html');
      assume(results).property('head');
    });

    it('gasketData is empty object if no response data', async function () {
      WrappedDocument = withGasketData()(MyDocument);

      const results = await WrappedDocument.getInitialProps(mockContext);
      assume(results.gasketData).eqls({});
    });

    it('gasketData is from res.locals', async function () {
      WrappedDocument = withGasketData()(MyDocument);
      mockContext.res = {
        locals: {
          gasketData: { bogus: true }
        }
      };

      const results = await WrappedDocument.getInitialProps(mockContext);
      assume(results.gasketData).eqls({ bogus: true });
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

      assume(gasketDataScript).exists();
    });

    it('in custom document body', function () {
      WrappedDocument = withGasketData()(MyDocument);
      const element = new WrappedDocument();
      element.props = mockProps;
      const body = element.render().props.children[1];
      const gasketDataScript = body.props.children[1];

      assume(gasketDataScript).exists();
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

      assume(gasketDataScript).exists();

      // from parent
      assume(html).exists();
      assume(head).exists();
      assume(main).exists();
      assume(nextScript).exists();
      assume(getElementReference(html, 'p')).exists();
    });

    it('between Main and NextScript', function () {
      WrappedDocument = withGasketData()(MyDocument);
      const element = new WrappedDocument();
      element.props = mockProps;
      const body = getElementReference(element.render(), 'body');

      assume(body.props.children[0].type.name).equals('Main');
      assume(body.props.children[1].type.name).equals('GasketDataScript');
      assume(body.props.children[2].type.name).equals('NextScript');
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

      assume(body.props.children[0].type).equals('div');
      assume(body.props.children[1].type.name).equals('GasketDataScript');
      assume(body.props.children[2].type).equals('script');
      assume(body.props.children[3].type.name).equals('NextScript');
    });

    it('after first element (assume to be wrapping Main)', function () {
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

      assume(body.props.children[0].type).equals('div');
      assume(body.props.children[1].type.name).equals('GasketDataScript');
      assume(body.props.children[2].type).equals('div');
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

      assume(body.props.children[0].type).equals('header');
      assume(body.props.children[1].type.name).equals('Main');
      assume(body.props.children[2].type).equals('script');
      assume(body.props.children[3].type).equals('div');
      assume(body.props.children[4].type.name).equals('GasketDataScript');
      assume(body.props.children[5].type).equals('footer');
      assume(body.props.children[6].type.name).equals('NextScript');
    });
  });
});
