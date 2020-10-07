const assume = require('assume');
const init = require('../lib/init');

const intlPolyfill = require('intl');
const intlDefault = global.Intl;

describe('init', () => {

  afterEach(() => {
    global.Intl = intlDefault;
  });

  it('polyfills Intl', () => {
    assume(global.Intl).equals(intlDefault);
    init();
    assume(global.Intl).equals(intlPolyfill);
  });
});
