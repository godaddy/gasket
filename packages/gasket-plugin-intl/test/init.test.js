const assume = require('assume');
const sinon = require('sinon');
const init = require('../lib/init');

const intlPolyfill = require('intl');
const intlDefault = global.Intl;

describe('init', function () {
  let versionStub;

  beforeEach(function () {
    versionStub = sinon.stub(process, 'version');
  });

  afterEach(function () {
    global.Intl = intlDefault;
    sinon.restore();
  });

  it('polyfills Intl for Node@10', function () {
    assume(global.Intl).equals(intlDefault);
    versionStub.get(() => 'v10.0.0');
    init();
    assume(global.Intl).equals(intlPolyfill);
  });

  it('polyfills Intl for Node@12', function () {
    assume(global.Intl).equals(intlDefault);
    versionStub.get(() => 'v12.0.0');
    init();
    assume(global.Intl).equals(intlPolyfill);
  });

  it('does NOT polyfill Intl for Node@14', function () {
    assume(global.Intl).equals(intlDefault);
    versionStub.get(() => 'v14.0.0');
    init();
    assume(global.Intl).equals(intlDefault);
  });

  it('does NOT polyfill Intl for Node@16', function () {
    assume(global.Intl).equals(intlDefault);
    versionStub.get(() => 'v16.0.0');
    init();
    assume(global.Intl).equals(intlDefault);
  });

  it('does NOT polyfill Intl for Node@18', function () {
    assume(global.Intl).equals(intlDefault);
    versionStub.get(() => 'v18.0.0');
    init();
    assume(global.Intl).equals(intlDefault);
  });
});
