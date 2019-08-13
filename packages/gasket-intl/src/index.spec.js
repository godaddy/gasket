import * as Index from './index';

describe('index', () => {
  it('exposes components', () => {
    expect(Index).toHaveProperty('LocaleRequired', expect.any(Function));
    expect(Index).toHaveProperty('withLocaleRequired', expect.any(Function));
    expect(Index).toHaveProperty('withIntlProvider', expect.any(Function));
  });
});
