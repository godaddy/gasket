import React from 'react';
import NextDocument from 'next/document';
import { GasketDataProvider, GasketDataScript, useGasketData, withGasketData, withGasketDataProvider } from '@gasket/nextjs';
import { GasketData } from '@gasket/data';


describe('gasket/nextjs', function () {
  const perform = false;

  describe('withGasketData', function () {
    it('has expected API', function () {
      class BaseDocument extends NextDocument {
        render() {
          return <div>Whatever</div>;
        }
      }

      const WrappedDocument = withGasketData({ index: 2 })(BaseDocument);

      class MyDocument extends WrappedDocument {}
    });
  });

  describe('useGasketData', function () {
    it('has expected API', function () {
      if (perform) {
        const result: GasketData = useGasketData();
      }
    });
  });

  describe('GasketDataScript', function () {
    it('has expected API', function () {
      <GasketDataScript data={{}}/>;

      <GasketDataScript data={{
        intl: {
          locale: 'en',
          basePath: '/locales',
          messages: {},
          status: {}
        },
        config: {}
      }}/>;
    });
  });

  describe('GasketDataProvider', function () {
    it('has expected API', function () {
      if (perform) {
        <GasketDataProvider gasketData={{}}>
          <div>Some children</div>
        </GasketDataProvider>;

        <GasketDataProvider gasketData={{
          intl: {
            locale: 'en',
            basePath: '/locales',
            messages: {},
            status: {}
          },
          config: {}
        }}>
          <div>Some children</div>
        </GasketDataProvider>;
      }
    });
  });

  describe('withGasketDataProvider', function () {
    it('takes a component type and returns a component type', function () {
      const Original = (props: { label: string }) => <div>{props.label}</div>;
      const Modified = withGasketDataProvider()(Original);
      <Modified label='foo'/>;
    });
  });
});
