const init = require('../lib/init');
const intlPolyfill = require('intl');
const intlDefault = global.Intl;

describe('init', function () {

  beforeEach(function () {
    global.process = { ...process };
  });

  afterEach(function () {
    global.Intl = intlDefault;
  });

  it('polyfills Intl for Node@10', function () {
    expect(global.Intl).toEqual(intlDefault);
    global.process.version = 'v10.0.0';
    init();
    expect(global.Intl).toEqual(intlPolyfill);
  });

  it('polyfills Intl for Node@12', function () {
    expect(global.Intl).toEqual(intlDefault);
    global.process.version = 'v12.0.0';
    init();
    expect(global.Intl).toEqual(intlPolyfill);
  });

  it('does NOT polyfill Intl for Node@14', function () {
    expect(global.Intl).toEqual(intlDefault);
    global.process.version = 'v14.0.0';
    init();
    expect(global.Intl).toEqual(intlDefault);
  });

  it('does NOT polyfill Intl for Node@16', function () {
    expect(global.Intl).toEqual(intlDefault);
    global.process.version = 'v16.0.0';
    init();
    expect(global.Intl).toEqual(intlDefault);
  });

  it('does NOT polyfill Intl for Node@18', function () {
    expect(global.Intl).toEqual(intlDefault);
    global.process.version = 'v18.0.0';
    init();
    expect(global.Intl).toEqual(intlDefault);
  });
});
