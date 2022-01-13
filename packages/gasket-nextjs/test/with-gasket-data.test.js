import React from 'react';
import assume from 'assume';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import { withGasketData, GasketDataScript } from '../src';

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
        <Head/>
        <body>
          <Main/>
          <NextScript/>
          <p>some footer content</p>
        </body>
      </Html>
    );
  }
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
    it('in document body', function () {
      WrappedDocument = withGasketData()(Document);

      const wrapper = shallow(<WrappedDocument { ...mockProps } />);
      assume(wrapper.find('body').find(GasketDataScript)).length(1);
    });

    it('in custom document body', function () {
      WrappedDocument = withGasketData()(MyDocument);

      const wrapper = shallow(<WrappedDocument { ...mockProps } />);
      assume(wrapper.find('body').find(GasketDataScript)).length(1);
    });

    it('retains all original content', function () {
      WrappedDocument = withGasketData()(MyDocument);

      const wrapper = shallow(<WrappedDocument { ...mockProps } />);

      assume(wrapper.find('body').find(GasketDataScript)).length(1);

      // from parent
      assume(wrapper.find(Html)).length(1);
      assume(wrapper.find(Head)).length(1);
      assume(wrapper.find('body').find(Main)).length(1);
      assume(wrapper.find('body').find(NextScript)).length(1);
      assume(wrapper.find('body').find('p')).length(1);
    });

    it('between Main and NextScript', function () {
      WrappedDocument = withGasketData()(MyDocument);

      const wrapper = shallow(<WrappedDocument { ...mockProps } />);
      assume(wrapper.find('body').children().at(0).name()).equals('Main');
      assume(wrapper.find('body').children().at(1).name()).equals('GasketDataScript');
      assume(wrapper.find('body').children().at(2).name()).equals('NextScript');
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
              <Head/>
              <body>
                <div/>
                <script id='CustomScript'/>
                <NextScript/>
              </body>
            </Html>
          );
        }
      }

      WrappedDocument = withGasketData()(MyDocumentWithScript);

      const wrapper = shallow(<WrappedDocument { ...mockProps } />);
      assume(wrapper.find('body').children().at(0).name()).equals('div');
      assume(wrapper.find('body').children().at(1).name()).equals('GasketDataScript');
      assume(wrapper.find('body').children().at(2).name()).equals('script');
      assume(wrapper.find('body').children().at(3).name()).equals('NextScript');
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
              <Head/>
              <body>
                <div id='SomethingWrappingMain'>
                  <Main/>
                </div>
                <div id='SomethingWrappingNextScript'>
                  <NextScript/>
                </div>
              </body>
            </Html>
          );
        }
      }

      WrappedDocument = withGasketData()(MyDocumentWithScript);

      const wrapper = shallow(<WrappedDocument { ...mockProps } />);
      assume(wrapper.find('body').children().at(0).name()).equals('div');
      assume(wrapper.find('body').children().at(1).name()).equals('GasketDataScript');
      assume(wrapper.find('body').children().at(2).name()).equals('div');
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
              <Head/>
              <body>
                <header />
                <Main/>
                <script />
                <div />
                <footer />
                <NextScript/>
              </body>
            </Html>
          );
        }
      }

      WrappedDocument = withGasketData({ index: 4 })(MyDocumentWithScript);

      const wrapper = shallow(<WrappedDocument { ...mockProps } />);
      assume(wrapper.find('body').children().at(0).name()).equals('header');
      assume(wrapper.find('body').children().at(1).name()).equals('Main');
      assume(wrapper.find('body').children().at(2).name()).equals('script');
      assume(wrapper.find('body').children().at(3).name()).equals('div');
      assume(wrapper.find('body').children().at(4).name()).equals('GasketDataScript');
      assume(wrapper.find('body').children().at(5).name()).equals('footer');
      assume(wrapper.find('body').children().at(6).name()).equals('NextScript');
    });
  });
});
