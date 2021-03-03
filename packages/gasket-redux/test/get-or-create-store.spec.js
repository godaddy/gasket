import getOrCreateStore  from '../src/get-or-create-store';

const newStore = 'NEW STORE';
const existingStore = 'EXISTING STORE';

describe('getOrCreateStore', () => {
  let makeStore;
  beforeEach(() => {
    makeStore = jest.fn().mockReturnValue(newStore);
  });

  it('returns an function', () => {
    const results = getOrCreateStore(makeStore);
    expect(results).toEqual(expect.any(Function));
  });

  it('returns existing store from appCtx.ctx.req', () => {
    const wrapper = getOrCreateStore(makeStore);
    const results = wrapper({ ctx: { req: { store: existingStore } } });
    expect(results).toEqual(existingStore);
  });

  it('returns existing store from ctx.req', () => {
    const wrapper = getOrCreateStore(makeStore);
    const results = wrapper({ req: { store: existingStore } });
    expect(results).toEqual(existingStore);
  });

  it('returns existing store from ctx', () => {
    const wrapper = getOrCreateStore(makeStore);
    const results = wrapper({ store: existingStore });
    expect(results).toEqual(existingStore);
  });

  it('creates new store', () => {
    const wrapper = getOrCreateStore(makeStore);
    const results = wrapper();
    expect(results).toEqual(newStore);
  });
});
