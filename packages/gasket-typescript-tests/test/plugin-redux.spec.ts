import type { IncomingMessage, OutgoingMessage } from 'http';
import type { Gasket, GasketConfigDefinition, Hook } from '@gasket/core';
import type { Store } from 'redux';
import '@gasket/plugin-redux';

describe('@gasket/plugin-redux', () => {
  it('adds a redux config property to Gasket', () => {
    const config: GasketConfigDefinition = {
      plugins: [{ name: 'example-plugin', hooks: {} }],
      redux: {
        makeStore: './relative/path/to/customMakeStore.js',
        initState: {
          urls: {
            fooService: 'https://foo.url/',
            barService: 'https://bar.url/'
          }
        }
      },

      environments: {
        test: {
          redux: {
            initState: {
              urls: {
                fooService: 'https://test.foo.url/'
              }
            }
          }
        }
      }
    };
  });

  it('adds an initReduxState lifecycle', () => {
    const hook: Hook<'initReduxState'> = (
      gasket: Gasket,
      state: any,
      context: { req: IncomingMessage, res: OutgoingMessage }
      // context: { req: IncomingMessage, res: OutgoingMessage }
    ) => {
      return {
        ...state,
        another: 'property'
      };
    };
  });

  it('adds an initReduxStore lifecycle', () => {
    const hook: Hook<'initReduxStore'> = (
      gasket: Gasket,
      store: Store,
      context: { req: IncomingMessage, res: OutgoingMessage }
    ) => {
      store.dispatch({ type: 'init', payload: { some: 'data' } });
    };
  });
});
