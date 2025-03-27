import { expect, vi } from 'vitest';
import configureMakeStore, { prepareReducer } from '../src/configure-make-store';
import { withExtraArgument } from 'redux-thunk';

const mockInitialState = { bogus: 'BOGUS' };

const mockMiddleware = vi.fn(() => next => action => next(action));
const mockEnhancer = vi.fn(createStore => (reducer, initialState, enhancer) => createStore(reducer, initialState, enhancer));
const mockPostCreate = vi.fn();

describe('configureMakeStore', () => {
  let result, makeStore, store;

  it('returns a make store function', () => {
    result = configureMakeStore();
    expect(result).toBeInstanceOf(Function);
    expect(result).toHaveProperty('name', 'makeStore');
  });

  it('accepts no arguments', () => {
    result = configureMakeStore();
    expect(result).toBeInstanceOf(Function);
  });

  it('accepts empty options object', () => {
    result = configureMakeStore({});
    expect(result).toBeInstanceOf(Function);
  });

  it('accepts callback optionsFn', () => {
    result = configureMakeStore(() => {});
    expect(result).toBeInstanceOf(Function);
  });

  it('accepts callback optionsFn called with makeStoreOptions', () => {
    const mockMakeOptions = { logger: {}, req: {} };
    const mockOptionsFn = vi.fn().mockReturnValue({});
    configureMakeStore(mockOptionsFn)({}, mockMakeOptions);
    expect(mockOptionsFn).toHaveBeenCalledWith(mockMakeOptions);
  });

  it('allows custom initial state', () => {
    store = configureMakeStore({ initialState: mockInitialState })();
    const state = store.getState();

    for (const [key, value] of Object.entries(mockInitialState)) {
      expect(state).toHaveProperty(key, value);
    }
  });

  it('allows custom initial state from callback optionsFn', () => {
    store = configureMakeStore(() => ({ initialState: mockInitialState }))();
    const state = store.getState();

    for (const [key, value] of Object.entries(mockInitialState)) {
      expect(state).toHaveProperty(key, value);
    }
  });

  it('allows custom middleware', () => {
    const mockMiddleware = () => (next) => (action) => {
      if (action.type === 'TEST_ACTION') {
        return { ...action, modified: true };
      }
      return next(action);
    };

    makeStore = configureMakeStore({ middleware: [mockMiddleware] });
    store = makeStore();

    const action = { type: 'TEST_ACTION' };
    result = store.dispatch(action);

    expect(result).toEqual({ ...action, modified: true });
  });

  it('allows custom middleware from callback optionsFn', () => {
    const mockMiddleware = () => (next) => (action) => {
      if (action.type === 'TEST_ACTION') {
        return { ...action, modified: true };
      }
      return next(action);
    };

    makeStore = configureMakeStore(() => ({ middleware: [mockMiddleware] }));
    store = makeStore();

    const action = { type: 'TEST_ACTION' };
    result = store.dispatch(action);

    expect(result).toEqual({ ...action, modified: true });
  });

  it('adds thunk and logger middleware if enabled', () => {
    const consoleLogSpy = vi.spyOn(console, 'log');

    // Create the store with logging enabled
    makeStore = configureMakeStore({ logging: true });
    store = makeStore();

    // Dispatch a test action
    const action = { type: 'TEST_ACTION', payload: 'test payload' };
    store.dispatch(action);

    expect(consoleLogSpy.mock.calls[0][0]).toContain('TEST_ACTION');
    consoleLogSpy.mockRestore();
  });

  it('allows adding custom thunk middleware', () => {
    const functionForExtraArg = vi.fn();
    const exampleAction = vi.fn(() => {
      return (getState, dispatch, functionAsExtraArg) => {
        functionAsExtraArg('value');
      };
    });
    const exampleReducer = vi.fn((state = 'initialState') => state);
    const thunkMiddleware = withExtraArgument(functionForExtraArg);
    makeStore = configureMakeStore({
      reducers: {
        exampleReducer
      },
      thunkMiddleware
    });
    store = makeStore();
    store.dispatch(exampleAction());

    expect(exampleAction).toHaveBeenCalled();
    expect(exampleReducer).toHaveBeenCalled();
    expect(functionForExtraArg).toHaveBeenCalledWith('value');
  });

  it('allows removing logger middleware', () => {
    const consoleLogSpy = vi.spyOn(console, 'log');

    makeStore = configureMakeStore({
      middleware: [mockMiddleware],
      logging: false
    });

    store = makeStore();

    const action = { type: 'TEST_ACTION' };
    store.dispatch(action);
    expect(consoleLogSpy).not.toHaveBeenCalled();
    expect(mockMiddleware).toHaveBeenCalled();
    consoleLogSpy.mockRestore();
  });

  it('allows custom enhancers', () => {
    configureMakeStore({ enhancers: [mockEnhancer] })();
    expect(mockEnhancer).toHaveBeenCalled();
  });

  it('sets a default root reducer if no reducers passed', () => {
    store = configureMakeStore()();
    expect(store.getState()).toEqual({
      gasketData: null // default added for @gasket/plugin-redux
    });
  });

  it('allows custom reducers', () => {
    const mockReducers = {
      reducer1: f => f || {}
    };

    store = configureMakeStore({ reducers: mockReducers })();
    expect(store.getState()).toEqual({
      reducer1: {},
      gasketData: null // default added for @gasket/plugin-redux
    });
  });

  it('adds placeholder reducers', () => {
    store = configureMakeStore({ initialState: { bogus: true } })();
    expect(store.getState()).toEqual({
      bogus: true,
      gasketData: null // default added for @gasket/plugin-redux
    });
  });

  it('allows custom rootReducer', () => {
    const exampleReducer = vi.fn((state = 'initialState') => state);
    const exampleRootReducer = vi.fn((state = 'initialState') => state);
    makeStore = configureMakeStore({
      rootReducer: exampleRootReducer,
      reducers: {
        exampleReducer
      }
    });
    store = makeStore({});
    store.dispatch({ type: 'EXAMPLE' });

    expect(exampleRootReducer).toHaveBeenCalled();
    // passes through to combined reducers if state unchanged
    expect(exampleReducer).toHaveBeenCalled();
  });

  it('uses devtools composer if set', () => {
    const mockDevToolsCompose = vi.fn();
    // eslint-disable-next-line id-length
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ = mockDevToolsCompose;
    configureMakeStore({ enhancers: [mockEnhancer] })();
    expect(mockDevToolsCompose).toHaveBeenCalled();
    delete window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
  });

  it('calls postCreate callback with store', () => {
    makeStore = configureMakeStore({}, mockPostCreate);
    store = makeStore();
    expect(mockPostCreate).toHaveBeenCalledWith(store);
  });

  it('does not duplicate middleware from request to request', () => {
    const storeCreator = configureMakeStore({
      middleware: [mockMiddleware]
    });

    storeCreator({});
    storeCreator({});
    const applyMiddlewareCalls = mockMiddleware.mock.calls;
    const firstNumMiddlewares = applyMiddlewareCalls[0].length;

    const middlewareCountsMatch = applyMiddlewareCalls.every(call => call.length === firstNumMiddlewares);
    expect(middlewareCountsMatch).toEqual(true);
  });

  describe('makeStore', () => {
    beforeEach(() => {
      makeStore = configureMakeStore({ initialState: mockInitialState });
    });

    it('returns a redux store', () => {
      result = makeStore();
      expect(result).toBeInstanceOf(Object);
      expect(result).toHaveProperty('dispatch');
      expect(result).toHaveProperty('getState');
    });

    it('app initial state overrides configured initial state', () => {
      const mockAppInitState = { bogus: 'REPLACED', another: 'ONE' };
      store = makeStore(mockAppInitState);
      expect(store.getState()).not.toEqual(mockInitialState);

      const state = store.getState();
      for (const [key, value] of Object.entries(mockAppInitState)) {
        expect(state).toHaveProperty(key, value);
      }
    });

    it('returns existing redux store if already present on req', () => {
      const mockStore = {
        getState: vi.fn()
      };

      const mockLogger = {
        debug: vi.fn()
      };

      result = makeStore({}, { logger: mockLogger, req: { store: mockStore } });
      expect(result).toBe(mockStore);
    });
  });
});

describe('prepareReducer', () => {
  let result;
  const mockRootReducer = vi.fn((state = {}, { type } = {}) => type === 'ROOT' && { ...state, root: true } || state);
  const mockReducers = { fake: vi.fn((state = 'one') => state), fake2: vi.fn((state = 'two') => state) };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns base function if no reducers', function () {
    result = prepareReducer({});
    expect(result).toBeInstanceOf(Function);
    expect(result('fake')).toEqual('fake');
    expect(result()).toEqual({});
  });

  it('combines reducers', function () {
    result = prepareReducer(mockReducers);
    expect(result).toBeInstanceOf(Function);
    expect(result()).toEqual({ fake: 'one', fake2: 'two' });
    expect(mockReducers.fake).toHaveBeenCalled();
    expect(mockReducers.fake2).toHaveBeenCalled();
  });

  it('combines with root reducer', function () {
    result = prepareReducer(mockReducers, mockRootReducer);
    expect(result).toBeInstanceOf(Function);
  });

  it('pass through if state UNCHANGED by root', function () {
    result = prepareReducer(mockReducers, mockRootReducer);
    const initState = {};

    vi.clearAllMocks();
    expect(result(initState)).toEqual({ fake: 'one', fake2: 'two' });
    expect(mockRootReducer).toHaveBeenCalledTimes(1);
    expect(mockReducers.fake).toHaveBeenCalledTimes(1);
    expect(mockReducers.fake2).toHaveBeenCalledTimes(1);
  });

  it('does NOT pass through if state CHANGED by root', function () {
    result = prepareReducer(mockReducers, mockRootReducer);
    const initState = { existing: true };

    vi.clearAllMocks();
    expect(result(initState, { type: 'ROOT' })).toEqual({ ...initState, root: true });
    expect(mockRootReducer).toHaveBeenCalledTimes(1);
    expect(mockReducers.fake).toHaveBeenCalledTimes(0);
    expect(mockReducers.fake2).toHaveBeenCalledTimes(0);
  });
});
