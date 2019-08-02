import { withReducers } from './index';

describe('index', () => {
  it('exposes components', () => {
    expect(withReducers).toBeInstanceOf(Function);
  });
});
