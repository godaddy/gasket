import {GasketDataProvider, GasketDataScript, useGasketData, withGasketData} from '@gasket/nextjs';
import {GasketData} from "@gasket/data";


describe('gasket/nextjs', function () {
  const perform = false;

  describe('withGasketData', function () {
    it('has expected API', function () {
      const HOC: Function = withGasketData({
        index: 2
      });
    });
  });

  describe('useGasketData', function () {
    it('has expected API', function () {
      if (perform) {
        const result: GasketData = useGasketData()
      }
    });
  });

  describe('GasketDataScript', function () {
    it('has expected API', function () {
      const result: JSX.Element = GasketDataScript({data: {}})
      const result2: JSX.Element = GasketDataScript({
        data: {
          intl: {
            locale: 'en',
            basePath: '/locales',
            messages: {},
            status: {}
          },
          config: {}
        }
      })
    });
  });

  describe('GasketDataProvider', function () {
    it('has expected API', function () {
      if (perform) {
        const result: JSX.Element = GasketDataProvider({gasketData: {}, children: []})
        const result2: JSX.Element = GasketDataProvider({
          gasketData: {
            intl: {
              locale: 'en',
              basePath: '/locales',
              messages: {},
              status: {}
            },
            config: {}
          },
          children: []
        })
      }
    });
  });
});
