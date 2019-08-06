import { configureMakeStore } from '../src/index';

describe('index', () => {
  it('exposes components', () => {
    expect(configureMakeStore).toBeInstanceOf(Function);
  });
});
