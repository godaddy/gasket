import { configureMakeStore, getOrCreateStore, MakeStoreFn } from '@gasket/redux';
import type { Store } from 'redux';


describe('gasket/redux', function () {
  const perform = false;

  describe('configureMakeStore', function () {

    it('has expected API', function () {
      if (perform) {
        const result: MakeStoreFn = configureMakeStore({
          reducers: {},
          rootReducer: f => f,
          initialState: {
            fake: true
          },
          middleware: [() => {}],
          enhancers: [() => {}],
          logging: true,
          thunkMiddleware: () => {}
        });
      }
    });
  });

  describe('getOrCreateStore', function () {
    it('has expected API', function () {
      if (perform) {
        const fn: MakeStoreFn = (state) => {
          return {} as Store;
        };

        const results: object = getOrCreateStore(fn);
      }
    });
  });
});
