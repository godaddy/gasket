import { configureMakeStore } from './index';

describe('index', () => {
  it('exposes components', () => {
    expect(configureMakeStore).toBeInstanceOf(Function);
  });
});
