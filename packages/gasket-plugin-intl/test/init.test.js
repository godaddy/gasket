const assume = require('assume');
const init = require('../lib/init');

const intlPolyfill = require('intl');
const intlDefault = global.Intl;

describe('init', function () {

  afterEach(function () {
    global.Intl = intlDefault;
  });

  it('polyfills Intl', function () {
    assume(global.Intl).equals(intlDefault);
    init();
    assume(global.Intl).equals(intlPolyfill);
  });
});
