const init = require('./init');

const intlPolyfill = require('intl');
const intlDefault = global.Intl;

describe('init', () => {

  afterEach(() => {
    global.Intl = intlDefault;
  });

  it('polyfills Intl', () => {
    expect(global.Intl).toBe(intlDefault);
    init();
    expect(global.Intl).toBe(intlPolyfill);
  });
});
