import placeholderReducers  from '../src/placeholder-reducers';

describe('placeholderReducers', () => {
  let results, mockReducers, mockState;
  beforeEach(() => {
    mockReducers = {
      group1: f => f,
      group2: f => f
    };

    mockState = {};
  });

  it('returns an object', () => {
    results = placeholderReducers();
    expect(results).toEqual(expect.any(Object));
  });

  it('always returns default config reducer', () => {
    results = placeholderReducers(mockReducers);
    expect(results).toHaveProperty('config', expect.any(Function));
  });

  it('does not return config reducer if custom one set', () => {
    mockReducers.config = f => f;
    results = placeholderReducers(mockReducers);
    expect(results).not.toHaveProperty('config');
  });

  it('does not include placeholder initial state keys match reducers', () => {
    mockState.group1 = 'bogus';
    results = placeholderReducers(mockReducers, mockState);
    expect(results).not.toHaveProperty('group1');
  });

  it('returns placeholder reducer if initial state does not have matching reducer', () => {
    mockState.group3 = 'bogus';
    results = placeholderReducers(mockReducers, mockState);
    expect(results).not.toEqual({});
    expect(results).toHaveProperty('group3', expect.any(Function));
  });

  it('placeholder reducer returns initial state', () => {
    mockState.group3 = 'bogus';
    results = placeholderReducers(mockReducers, mockState).group3();
    expect(results).toEqual('bogus');
  });

  it('placeholder reducer returns passed state', () => {
    mockState.group3 = 'bogus';
    results = placeholderReducers(mockReducers, mockState).group3('BOGUS123');
    expect(results).not.toEqual('bogus');
    expect(results).toEqual('BOGUS123');
  });

  it('placeholder reducer returns null if initialState is undefined', () => {
    // eslint-disable-next-line no-undefined
    mockState.group3 = undefined;
    results = placeholderReducers(mockReducers, mockState).group3();
    expect(results).toEqual(null);
  });
});
