import { GasketDataProvider, GasketDataScript, useGasketData, withGasketData } from '@gasket/nextjs';
import { GasketData } from '@gasket/data';


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
        const result: GasketData = useGasketData();
      }
    });
  });

  describe('GasketDataScript', function () {
    it('has expected API', function () {
      /* eslint-disable new-cap */
      const result: JSX.Element = GasketDataScript({ data: {} });
      const result2: JSX.Element = GasketDataScript({
      /* eslint-enable new-cap */
        data: {
          intl: {
            locale: 'en',
            basePath: '/locales',
            messages: {},
            status: {}
          },
          config: {}
        }
      });
    });
  });

  describe('GasketDataProvider', function () {
    it('has expected API', function () {
      if (perform) {
        /* eslint-disable new-cap */
        const result: JSX.Element = GasketDataProvider({ gasketData: {}, children: [] });
        const result2: JSX.Element = GasketDataProvider({
          /* eslint-enable new-cap */
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
        });
      }
    });
  });
});
