import { describe, it, expect, beforeEach, vi } from 'vitest';
import initReduxState from '../lib/init-redux-state.js';

describe('initReduxState hook', () => {
  let gasket, getPublicGasketData;
  let req;

  beforeEach(() => {
    getPublicGasketData = vi.fn(() => ({ some: 'data' }));

    gasket = {
      actions: {
        getPublicGasketData
      }
    };
  });

  beforeEach(() => {
    req = {};
  });

  it('adds the `public` config section to the redux state', async () => {
    getPublicGasketData.mockResolvedValue({ something: 'public' });
    const startingState = {
      auth: { some: 'details' }
    };

    const newState = await initReduxState(
      gasket,
      startingState,
      {
        req
      }
    );

    expect(getPublicGasketData).toHaveBeenCalledWith(req);

    expect(newState).toEqual({
      auth: { some: 'details' },
      gasketData: { something: 'public' }
    });
  });

  it('does not overwrite any previously-present gasketData state', async () => {
    getPublicGasketData.mockResolvedValue({ something: 'public' });

    const startingState = {
      gasketData: { some: { existing: 'state' } }
    };

    const newState = await initReduxState(
      gasket,
      startingState,
      {
        req
      }
    );

    expect(newState).toEqual({
      gasketData: {
        some: { existing: 'state' },
        something: 'public'
      }
    });
  });
});
